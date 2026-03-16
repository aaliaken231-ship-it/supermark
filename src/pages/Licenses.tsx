import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Key, Plus, FileCheck, Shield, CheckCircle, 
  AlertCircle, Download, Upload, Lock, Clock, Timer, 
  Phone, CreditCard, Copy, RefreshCw, QrCode, Trash2,
  ChevronLeft, ChevronRight, Info, Zap
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

// Services and utilities
import { db, STORES, getAll, add, put } from '@/src/services/db';
import { encryptData, decryptData, generateLicenseCode } from '@/src/services/license';
import { getCurrentUser } from '@/src/services/auth';
import { downloadFile, selectFile, copyToClipboard } from '../utils/file';

// Types
import { License } from '@/src/types';

// External dependencies
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

/**
 * License Management Page
 * Secure encryption key - In production, should use environment variables
 */
const SECRET_KEY = process.env.REACT_APP_LICENSE_SECRET || 'supermarket-license-secret-key-2026';

// Grace period for expired licenses before complete lockout (48 hours)
const GRACE_PERIOD_MS = 48 * 60 * 60 * 1000;

// Pagination settings
const ITEMS_PER_PAGE = 5;

/**
 * License types configuration with enhanced details
 * Each type includes: label, duration, price, description, color, and features
 */
type LicenseTypeKey = 'gratuite' | 'mensuelle' | 'annuelle' | 'vie' | 'trial';

interface LicenseTypeConfig {
  label: string;
  days: number;
  price: number;
  description: string;
  color: string;
  features: string[];
}

const LICENSE_TYPES: Record<LicenseTypeKey, LicenseTypeConfig> = {
  gratuite: {
    label: 'Licence Gratuite',
    days: 7,
    price: 0,
    description: 'Essai gratuit de 7 jours pour découvrir l\'application',
    color: 'bg-gray-500',
    features: ['Accès limité aux fonctionnalités', 'Support par email', 'Données limitées', 'Max 3 utilisateurs']
  },
  mensuelle: {
    label: 'Licence Mensuelle',
    days: 30,
    price: 10000,
    description: 'Licence mensuelle pour une utilisation professionnelle et scalable',
    color: 'bg-blue-500',
    features: ['Toutes les fonctionnalités', 'Support prioritaire', 'Mises à jour incluses', 'Max 10 utilisateurs']
  },
  annuelle: {
    label: 'Licence Annuelle',
    days: 365,
    price: 70000,
    description: 'Licence annuelle avec économie de 50 000 FCFA comparé au mensuel',
    color: 'bg-purple-500',
    features: ['Toutes les fonctionnalités', 'Support 24/7', 'Formation incluse', 'Mises à jour illimitées', 'Max 20 utilisateurs']
  },
  vie: {
    label: 'Licence à Vie',
    days: 36135, // 99 years
    price: 200000,
    description: 'Licence permanente (99 ans) pour une tranquillité totale d\'exploitation',
    color: 'bg-amber-500',
    features: ['Accès illimité à vie', 'Support VIP', 'Toutes les mises à jour', 'Formation personnalisée', 'Assistance sur site', 'Utilisateurs illimités']
  },
  trial: {
    label: 'Essai Gratuit',
    days: 30,
    price: 0,
    description: 'Essai gratuit de 30 jours pour les nouveaux utilisateurs avec accès complet',
    color: 'bg-emerald-500',
    features: ['Toutes les fonctionnalités', 'Support limité', '30 jours d\'essai complet', 'Max 5 utilisateurs']
  }
};

/**
 * Payment information - centralized configuration
 * In production, these should be loaded from environment variables
 */
const PAYMENT_INFO = {
  mobileMoneyNumbers: ['+225 59783511', '+225 48987468'],
  email: process.env.REACT_APP_PAYMENT_EMAIL || 'christophefolinga@gmail.com',
  qrCodeData: process.env.REACT_APP_PAYMENT_QR || 'https://payment.example.com/pay?to=supermarket-app'
};

/**
 * Machine ID generation - Fingerprinting for device identification
 */
const getMachineId = (): string => {
  try {
    const navigator_info = window.navigator;
    const screen_info = window.screen;
    
    let uid = navigator_info.mimeTypes.length.toString();
    uid += navigator_info.userAgent.replace(/\D+/g, '');
    uid += navigator_info.plugins.length;
    uid += screen_info.height || '';
    uid += screen_info.width || '';
    uid += screen_info.pixelDepth || '';
    uid += screen_info.devicePixelRatio || '';
    
    return btoa(uid).slice(0, 32);
  } catch (error) {
    console.error('Error generating machine ID:', error);
    return btoa(Date.now().toString()).slice(0, 32);
  }
};

// Machine ID generation (Fingerprinting)
const getMachineId = (): string => {
  const navigator_info = window.navigator;
  const screen_info = window.screen;
  let uid = navigator_info.mimeTypes.length.toString();
  uid += navigator_info.userAgent.replace(/\D+/g, '');
  uid += navigator_info.plugins.length;
  uid += screen_info.height || '';
  uid += screen_info.width || '';
  uid += screen_info.pixelDepth || '';
  return CryptoJS.SHA256(uid).toString();
};

// Encryption/Decryption using AES
// Crypto functions are imported from @/src/services/license
// encryptData, decryptData, generateLicenseCode are re-exported above

/**
 * License Countdown Component
 * Displays remaining time until license expiration with real-time updates
 */
interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isWarning: boolean;
  isGrace: boolean;
}

const LicenseCountdown = ({ expiresAt }: { expiresAt: string }) => {
  const [timeLeft, setTimeLeft] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    isWarning: false,
    isGrace: false
  });

  useEffect(() => {
    const calculateTime = () => {
      try {
        const now = new Date().getTime();
        const expiry = new Date(expiresAt).getTime();
        const diff = expiry - now;

        // License has passed grace period - completely expired
        if (diff <= -GRACE_PERIOD_MS) {
          setTimeLeft({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isExpired: true,
            isWarning: false,
            isGrace: false
          });
          return;
        }

        // In grace period
        if (diff <= 0) {
          const graceDiff = GRACE_PERIOD_MS + diff;
          setTimeLeft({
            days: 0,
            hours: Math.floor(graceDiff / (1000 * 60 * 60)),
            minutes: Math.floor((graceDiff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((graceDiff % (1000 * 60)) / 1000),
            isExpired: false,
            isWarning: true,
            isGrace: true
          });
          return;
        }

        // Normal countdown
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        setTimeLeft({
          days,
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
          isExpired: false,
          isWarning: days < 7,
          isGrace: false
        });
      } catch (error) {
        console.error('Error calculating countdown:', error);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  // Determine colors based on status
  const bgColor = timeLeft.isExpired
    ? 'bg-red-500/20 text-red-600'
    : timeLeft.isGrace
      ? 'bg-amber-500/20 text-amber-600'
      : timeLeft.isWarning
        ? 'bg-red-500/10 text-red-600'
        : 'bg-primary/10 text-primary';

  const textColor = timeLeft.isExpired || timeLeft.isWarning ? 'text-red-600' : timeLeft.isGrace ? 'text-amber-600' : '';

  if (timeLeft.isExpired) {
    return (
      <div className="flex items-center gap-2 font-mono text-lg text-red-600">
        <AlertCircle className="w-5 h-5" />
        <span className="bg-red-500/20 px-3 py-1 rounded font-bold">LICENCE EXPIRÉE</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 font-mono text-lg ${textColor}`}>
      {timeLeft.isGrace && (
        <span className="text-xs font-bold uppercase mr-2 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Délai de grâce:
        </span>
      )}
      <span className={`${bgColor} px-2 py-1 rounded font-semibold`}>{timeLeft.days}J</span>
      <span className={textColor}>-</span>
      <span className={`${bgColor} px-2 py-1 rounded`}>{pad(timeLeft.hours)}</span>
      <span className={textColor}>:</span>
      <span className={`${bgColor} px-2 py-1 rounded`}>{pad(timeLeft.minutes)}</span>
      <span className={textColor}>:</span>
      <span className={`${bgColor} px-2 py-1 rounded`}>{pad(timeLeft.seconds)}</span>
    </div>
  );
};

export default function Licenses() {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showConfirmCreate, setShowConfirmCreate] = useState(false);
  const [selectedLicenseType, setSelectedLicenseType] = useState<keyof typeof LICENSE_TYPES>('mensuelle');
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [activeLicense, setActiveLicense] = useState<License | null>(null);
  const [licenseHistory, setLicenseHistory] = useState<License[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => { checkSession(); }, []);

  const loadLicenses = useCallback(async () => {
    try {
      const licenses = await db.getLicenses();
      setLicenseHistory(licenses.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      
      const active = await db.getActiveLicense();
      setActiveLicense(active || null);

      // Clock rollback detection
      const systemData = await getAll(STORES.SYSTEM);
      const now = new Date().getTime();
      if (systemData.length > 0) {
        const lastTime = new Date(systemData[0].lastKnownTime).getTime();
        if (now < lastTime) {
          toast.error("Alerte Sécurité", {
            description: "Manipulation de l'horloge système détectée. L'accès peut être restreint.",
            duration: 10000
          });
        }
        await put(STORES.SYSTEM, { ...systemData[0], lastKnownTime: new Date().toISOString() });
      } else {
        await add(STORES.SYSTEM, { lastKnownTime: new Date().toISOString(), machineId: getMachineId() });
      }
    } catch (error) {
      console.error('Error loading licenses:', error);
    }
  }, []);

  const checkSession = () => {
    const sessionData = localStorage.getItem('supermarket_session');
    if (!sessionData) { navigate('/auth'); return; }
    const parsed = JSON.parse(sessionData);
    
    // Basic session integrity check
    if (parsed.user_type === 'SuperAdmin' && !parsed.isAdminVerified) {
      // In a real app, we'd verify a signature here
    }

    if (!['SuperAdmin', 'Administrateur'].includes(parsed.user_type)) { navigate('/dashboard'); return; }
    setSession(parsed);
    setIsSuperAdmin(parsed.user_type === 'SuperAdmin');
    loadLicenses();
  };

  // 1. Create License Request
  const handleCreateLicense = async () => {
    setShowConfirmCreate(false);
    const code = generateLicenseCode();
    const now = new Date().toISOString();
    const licenseType = LICENSE_TYPES[selectedLicenseType];
    const machineId = getMachineId();
    
    const licenseData = {
      type: 'request',
      code: code,
      email: PAYMENT_INFO.email,
      role: session.user_type,
      licenseType: selectedLicenseType,
      days: licenseType.days,
      price: licenseType.price,
      machineId: machineId,
      createdAt: now
    };
    
    const encryptedContent = encryptData(JSON.stringify(licenseData));
    
    // Save to IndexedDB
    await db.addLicense({
      code,
      email: PAYMENT_INFO.email,
      role: session.user_type,
      status: 'pending',
      type_licence: selectedLicenseType,
      duree_jours: licenseType.days,
      prix: licenseType.price,
      machine_id: machineId,
      created_at: now
    });
    
    // Create downloadable file
    const blob = new Blob([encryptedContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `licence_request_${selectedLicenseType}_${code.substring(0, 5)}.lic`;
    a.click();
    URL.revokeObjectURL(url);

    await db.addActivityLog({
      type_action: 'Création Licence',
      utilisateur: session.nom_utilisateur,
      date_action: now,
      details: `Demande de licence ${licenseType.label} créée: ${code} - Machine: ${machineId.substring(0, 8)}`,
      module: 'Licences',
      created_at: now
    });

    loadLicenses();

    toast.success("Demande de licence créée", {
      description: `Envoyez le fichier à: ${PAYMENT_INFO.email}.`,
    });
  };

  // 2. Generate License (SuperAdmin only)
  const handleGenerateLicense = () => {
    if (!isSuperAdmin) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.lic';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const encrypted = event.target?.result as string;
          const decrypted = decryptData(encrypted);
          if (!decrypted) throw new Error("Decryption failed");
          
          const requestData = JSON.parse(decrypted);

          // Validate request type and email
          if (requestData.type !== 'request') {
            toast.error("Erreur", { description: "Ce n'est pas un fichier de demande" });
            return;
          }

          const licenseType = requestData.licenseType as keyof typeof LICENSE_TYPES;
          const typeInfo = LICENSE_TYPES[licenseType] || LICENSE_TYPES.mensuelle;
          const days = requestData.days || typeInfo.days;

          const now = new Date();
          const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

          // Generate full license
          const fullLicense = {
            type: 'license',
            code: requestData.code,
            email: PAYMENT_INFO.email,
            role: requestData.role,
            licenseType: licenseType,
            duration: days,
            price: requestData.price || typeInfo.price,
            machineId: requestData.machineId,
            generatedAt: now.toISOString(),
            expiresAt: expiresAt.toISOString()
          };

          const encryptedLicense = encryptData(JSON.stringify(fullLicense));
          
          // Update license in IndexedDB
          const existingLicenses = await db.getLicenses();
          const existingLicense = existingLicenses.find(l => l.code === requestData.code);
          
          if (existingLicense) {
            await db.updateLicense({
              ...existingLicense,
              status: 'generated',
              duree_jours: days
            });
          }
          
          const blob = new Blob([encryptedLicense], { type: 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `licence_${days}j_${licenseType}_${requestData.code.substring(0, 5)}.lic`;
          a.click();
          URL.revokeObjectURL(url);

          await db.addActivityLog({
            type_action: 'Génération Licence',
            utilisateur: session.nom_utilisateur,
            date_action: now.toISOString(),
            details: `Licence ${typeInfo.label} générée: ${requestData.code}`,
            module: 'Licences',
            created_at: now.toISOString()
          });

          loadLicenses();

          toast.success("Licence générée", {
            description: `Fichier de licence créé avec succès`,
          });
        } catch (err) {
          toast.error("Erreur", { description: "Fichier invalide ou corrompu" });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // 3. Activate License
  const handleActivateLicense = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.lic';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const encrypted = event.target?.result as string;
          const decrypted = decryptData(encrypted);
          if (!decrypted) throw new Error("Decryption failed");
          
          const licenseData = JSON.parse(decrypted);

          // Validate license type
          if (licenseData.type !== 'license') {
            toast.error("Erreur", { description: "Ce n'est pas un fichier de licence valide" });
            return;
          }

          // Machine ID Check
          const currentMachineId = getMachineId();
          if (licenseData.machineId && licenseData.machineId !== currentMachineId) {
            toast.error("Erreur d'activation", { 
              description: "Cette licence est liée à un autre appareil." 
            });
            await add(STORES.FAILED_ACTIVATIONS, {
              code: licenseData.code,
              reason: 'Machine ID mismatch',
              attemptedMachineId: currentMachineId,
              date: new Date().toISOString()
            });
            return;
          }

          const days = licenseData.duration;
          const licenseType = licenseData.licenseType as keyof typeof LICENSE_TYPES || 'mensuelle';
          const typeInfo = LICENSE_TYPES[licenseType] || LICENSE_TYPES.mensuelle;

          // Check if license was already activated and used
          const existingLicenses = await db.getLicenses();
          const existingLicense = existingLicenses.find(l => l.code === licenseData.code);

          if (existingLicense && existingLicense.status === 'activated' && existingLicense.activated_at) {
            const isExpired = existingLicense.expires_at && new Date(existingLicense.expires_at) < new Date();
            
            if (isExpired) {
              toast.error("Licence déjà utilisée", { 
                description: `Cette licence a déjà expiré.`, 
              });
              return;
            }
            
            toast("Licence déjà active", { 
              description: `Cette licence est déjà active.`, 
            });
            return;
          }

          const now = new Date();
          const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

          if (existingLicense) {
            await db.updateLicense({
              ...existingLicense,
              status: 'activated',
              activated_at: now.toISOString(),
              expires_at: expiresAt.toISOString()
            });
          } else {
            await db.addLicense({
              code: licenseData.code,
              email: licenseData.email,
              role: licenseData.role,
              status: 'activated',
              type_licence: licenseType,
              duree_jours: days,
              prix: licenseData.price || typeInfo.price,
              machine_id: licenseData.machineId,
              created_at: licenseData.generatedAt || now.toISOString(),
              activated_at: now.toISOString(),
              expires_at: expiresAt.toISOString()
            });
          }

          await db.addActivityLog({
            type_action: 'Activation Licence',
            utilisateur: session.nom_utilisateur,
            date_action: now.toISOString(),
            details: `Licence ${typeInfo.label} activée: ${licenseData.code}`,
            module: 'Licences',
            created_at: now.toISOString()
          });

          loadLicenses();

          toast.success("Licence activée avec succès!", {
            description: `${typeInfo.label} valide jusqu'au: ${expiresAt.toLocaleDateString('fr-FR')}`,
          });
        } catch (err) {
          toast.error("Erreur", { description: "Fichier licence invalide ou corrompu" });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // 4. Verify License (SuperAdmin only)
  const handleVerifyLicense = () => {
    if (!isSuperAdmin) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.lic';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const encrypted = event.target?.result as string;
          const decrypted = decryptData(encrypted);
          if (!decrypted) throw new Error("Decryption failed");
          
          const licenseData = JSON.parse(decrypted);

          const isExpired = licenseData.expiresAt ? new Date(licenseData.expiresAt) < new Date() : false;
          const isValid = licenseData.email === PAYMENT_INFO.email && 
                         (licenseData.type === 'license' || licenseData.type === 'request');
          
          // Calculate remaining days
          let remainingDays = 0;
          if (licenseData.expiresAt) {
            const diff = new Date(licenseData.expiresAt).getTime() - new Date().getTime();
            remainingDays = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
          }

          const licenseType = licenseData.licenseType as keyof typeof LICENSE_TYPES;
          const typeInfo = licenseType ? LICENSE_TYPES[licenseType] : null;

          setVerifyResult({
            ...licenseData,
            isValid,
            isExpired,
            remainingDays,
            typeInfo,
            status: isExpired ? 'Expirée' : (isValid ? 'Valide' : 'Invalide')
          });
          setShowVerifyDialog(true);
        } catch (err) {
          toast.error("Erreur", { description: "Impossible de lire le fichier" });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papier");
  };

  const exportLicenses = () => {
    const data = JSON.stringify(licenseHistory, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supermarket_licenses_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Sauvegarde exportée");
  };

  const isLicenseActive = activeLicense && activeLicense.expires_at && new Date(activeLicense.expires_at) > new Date();

  // Pagination logic
  const totalPages = Math.ceil(licenseHistory.length / itemsPerPage);
  const paginatedLicenses = licenseHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (license: License) => {
    if (license.status === 'activated' && license.expires_at) {
      const isExpired = new Date(license.expires_at) < new Date();
      if (isExpired) return <Badge className="bg-red-600">Expirée</Badge>;
      return <Badge className="bg-green-600">Active</Badge>;
    }
    if (license.status === 'generated') return <Badge className="bg-purple-600">Générée</Badge>;
    return <Badge className="bg-amber-600">En attente</Badge>;
  };

  const getLicenseTypeBadge = (type: string) => {
    const typeKey = type as keyof typeof LICENSE_TYPES;
    const typeInfo = LICENSE_TYPES[typeKey];
    if (!typeInfo) return <Badge variant="outline">{type}</Badge>;
    return <Badge className={typeInfo.color}>{typeInfo.label}</Badge>;
  };

  const getRemainingTime = (expiresAt?: string) => {
    if (!expiresAt) return '-';
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    if (diff <= 0) return 'Expirée';
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} jours`;
  };

  return (
    <div className="min-h-screen bg-background">
      <ScrollArea className="h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestion des Licences</h1>
              <p className="text-sm text-muted-foreground">Créer, générer, activer et vérifier les licences</p>
            </div>
          </div>

          {/* Current License Status Card */}
          {activeLicense && isLicenseActive && (
            <Card className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center bg-green-100 dark:bg-green-900/30 shrink-0">
                      <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg">Licence Active</h3>
                      <p className="text-xs text-muted-foreground font-mono truncate max-w-[200px] sm:max-w-none">{activeLicense.code}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {getLicenseTypeBadge(activeLicense.type_licence)}
                        <span className="text-xs text-muted-foreground">
                          Expire: {new Date(activeLicense.expires_at!).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-start sm:items-end gap-1 w-full sm:w-auto">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Timer className="w-3 h-3" />
                      <span>Temps restant:</span>
                    </div>
                    <LicenseCountdown expiresAt={activeLicense.expires_at!} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLicenseActive && (
            <Card className="border-2 border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 shrink-0">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">Aucune licence active</h3>
                    <p className="text-sm text-muted-foreground">Créez ou activez une licence pour continuer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons - Moved up for better visibility */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10" 
              onClick={() => setShowCreateDialog(true)}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-2">
                  <Plus className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-sm text-blue-700 dark:text-blue-400">Créer</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Nouvelle demande</p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${isSuperAdmin ? 'hover:shadow-lg hover:scale-[1.02] border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10' : 'opacity-50 cursor-not-allowed'}`}
              onClick={isSuperAdmin ? handleGenerateLicense : undefined}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-2">
                  {isSuperAdmin ? <Download className="w-6 h-6 text-purple-600" /> : <Lock className="w-6 h-6 text-gray-400" />}
                </div>
                <h3 className={`font-bold text-sm ${isSuperAdmin ? 'text-purple-700 dark:text-purple-400' : 'text-gray-500'}`}>Générer</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{isSuperAdmin ? 'SuperAdmin' : 'Restreint'}</p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10" 
              onClick={handleActivateLicense}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2">
                  <FileCheck className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-sm text-green-700 dark:text-green-400">Activer</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Importer licence</p>
              </CardContent>
            </Card>

            <Card 
              className={`cursor-pointer transition-all ${isSuperAdmin ? 'hover:shadow-lg hover:scale-[1.02] border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10' : 'opacity-50 cursor-not-allowed'}`}
              onClick={isSuperAdmin ? handleVerifyLicense : undefined}
            >
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-2">
                  {isSuperAdmin ? <Shield className="w-6 h-6 text-amber-600" /> : <Lock className="w-6 h-6 text-gray-400" />}
                </div>
                <h3 className={`font-bold text-sm ${isSuperAdmin ? 'text-amber-700 dark:text-amber-400' : 'text-gray-500'}`}>Vérifier</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{isSuperAdmin ? 'SuperAdmin' : 'Restreint'}</p>
              </CardContent>
            </Card>
          </div>

          {/* License Types Overview - Collapsible on mobile */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-4 h-4" />
                Types de Licences
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(LICENSE_TYPES).map(([key, type]) => (
                  <div 
                    key={key} 
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                      selectedLicenseType === key 
                        ? 'border-primary bg-primary/5 scale-[1.02]' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedLicenseType(key as keyof typeof LICENSE_TYPES)}
                  >
                    <div className={`w-8 h-8 rounded-lg ${type.color} flex items-center justify-center mb-2`}>
                      <Key className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-bold text-sm">{type.label}</h4>
                    <p className="text-lg font-bold text-primary">{type.price.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">FCFA / {type.days}j</p>
                  </div>
                ))}
              </div>
              
              {/* Payment Info - Compact */}
              <div className="mt-4 p-3 bg-primary/5 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">Paiement Mobile Money</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_INFO.mobileMoneyNumbers.map((num, i) => (
                    <span key={i} className="text-sm font-mono bg-background px-2 py-1 rounded-lg">{num}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Email: <strong>{PAYMENT_INFO.email}</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* License History Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="w-4 h-4" />
                  Historique des Licences
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={exportLicenses}>
                    <Download className="w-4 h-4 mr-2" />
                    Exporter Backup
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Code</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="hidden sm:table-cell">Prix</TableHead>
                      <TableHead className="hidden md:table-cell">Machine ID</TableHead>
                      <TableHead className="hidden lg:table-cell">Activation</TableHead>
                      <TableHead className="hidden lg:table-cell">Expiration</TableHead>
                      <TableHead>Restant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLicenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          Aucune licence enregistrée
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedLicenses.map((license, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono text-xs max-w-[120px] truncate">
                            {license.code}
                          </TableCell>
                          <TableCell>{getLicenseTypeBadge(license.type_licence)}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">{license.prix?.toLocaleString() || 0}</TableCell>
                          <TableCell className="hidden md:table-cell text-xs font-mono">
                            {license.machine_id ? `${license.machine_id.substring(0, 8)}...` : '-'}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm">
                            {license.activated_at ? new Date(license.activated_at).toLocaleDateString('fr-FR') : '-'}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm">
                            {license.expires_at ? new Date(license.expires_at).toLocaleDateString('fr-FR') : '-'}
                          </TableCell>
                          <TableCell>
                            {license.expires_at && license.status === 'activated' ? (
                              <span className={`text-sm font-medium ${new Date(license.expires_at) < new Date() ? 'text-red-600' : 'text-green-600'}`}>
                                {getRemainingTime(license.expires_at)}
                              </span>
                            ) : '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(license)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(license.code)}>
                              <Copy className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 p-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium">Page {currentPage} sur {totalPages}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Spacer for bottom padding */}
          <div className="h-8"></div>
        </div>
      </ScrollArea>

      {/* Create License Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Créer une demande de licence
            </DialogTitle>
            <DialogDescription>
              Sélectionnez le type de licence et générez un fichier de demande.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type de Licence</Label>
              <Select value={selectedLicenseType} onValueChange={(v) => setSelectedLicenseType(v as keyof typeof LICENSE_TYPES)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LICENSE_TYPES).map(([key, type]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span>{type.label}</span>
                        <span className="text-muted-foreground">- {type.price.toLocaleString()} FCFA ({type.days} jours)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg">
              <h4 className="font-semibold mb-2">{LICENSE_TYPES[selectedLicenseType].label}</h4>
              <p className="text-sm text-muted-foreground mb-2">{LICENSE_TYPES[selectedLicenseType].description}</p>
              <p className="text-2xl font-bold text-primary">{LICENSE_TYPES[selectedLicenseType].price.toLocaleString()} FCFA</p>
              <p className="text-sm text-muted-foreground">{LICENSE_TYPES[selectedLicenseType].days} jours de validité</p>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Moyens de paiement:
                </p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {PAYMENT_INFO.mobileMoneyNumbers.map((num, i) => (
                    <span key={i} className="font-mono bg-background px-2 py-1 rounded text-sm">{num}</span>
                  ))}
                </div>
                <p className="text-sm">
                  Email: <strong className="text-blue-600">{PAYMENT_INFO.email}</strong>
                </p>
              </div>
              <div className="bg-white p-2 rounded-lg shrink-0">
                <QRCodeSVG value={PAYMENT_INFO.qrCodeData} size={80} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Annuler</Button>
            <Button 
              onClick={() => {
                if (LICENSE_TYPES[selectedLicenseType].price > 0) {
                  setShowConfirmCreate(true);
                } else {
                  handleCreateLicense();
                }
              }} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Suivant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmCreate} onOpenChange={setShowConfirmCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la demande</DialogTitle>
            <DialogDescription>
              Vous allez créer une demande pour une licence <strong>{LICENSE_TYPES[selectedLicenseType].label}</strong> au prix de <strong>{LICENSE_TYPES[selectedLicenseType].price.toLocaleString()} FCFA</strong>.
              <br/><br/>
              Un fichier de demande sera téléchargé. Vous devrez l'envoyer à l'administrateur après avoir effectué le paiement.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmCreate(false)}>Annuler</Button>
            <Button onClick={handleCreateLicense} className="bg-blue-600 hover:bg-blue-700">
              Confirmer et Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verify Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-600" />
              Résultat de vérification
            </DialogTitle>
          </DialogHeader>
          {verifyResult && (
            <div className="space-y-4">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Email</TableCell>
                    <TableCell>{verifyResult.email}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Code</TableCell>
                    <TableCell className="font-mono text-xs">{verifyResult.code}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Type Fichier</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {verifyResult.type === 'license' ? 'Licence complète' : 'Demande'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                  {verifyResult.typeInfo && (
                    <TableRow>
                      <TableCell className="font-medium">Type Licence</TableCell>
                      <TableCell>
                        <Badge className={verifyResult.typeInfo.color}>{verifyResult.typeInfo.label}</Badge>
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell className="font-medium">Durée</TableCell>
                    <TableCell>{verifyResult.duration ? `${verifyResult.duration} jours` : verifyResult.days ? `${verifyResult.days} jours` : 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Prix</TableCell>
                    <TableCell>{verifyResult.price ? `${verifyResult.price.toLocaleString()} FCFA` : 'N/A'}</TableCell>
                  </TableRow>
                  {verifyResult.generatedAt && (
                    <TableRow>
                      <TableCell className="font-medium">Date génération</TableCell>
                      <TableCell>{new Date(verifyResult.generatedAt).toLocaleDateString('fr-FR')}</TableCell>
                    </TableRow>
                  )}
                  {verifyResult.expiresAt && (
                    <TableRow>
                      <TableCell className="font-medium">Date expiration</TableCell>
                      <TableCell>{new Date(verifyResult.expiresAt).toLocaleDateString('fr-FR')}</TableCell>
                    </TableRow>
                  )}
                  {verifyResult.remainingDays !== undefined && (
                    <TableRow>
                      <TableCell className="font-medium">Jours restants</TableCell>
                      <TableCell className={verifyResult.remainingDays > 0 ? 'text-green-600' : 'text-red-600'}>
                        {verifyResult.remainingDays} jours
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow>
                    <TableCell className="font-medium">Statut</TableCell>
                    <TableCell>
                      <Badge className={
                        verifyResult.isExpired ? 'bg-red-600' : 
                        verifyResult.isValid ? 'bg-green-600' : 'bg-amber-600'
                      }>
                        {verifyResult.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowVerifyDialog(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
