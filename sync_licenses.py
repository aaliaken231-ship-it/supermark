#!/usr/bin/env python3
"""
Synchronize improved licenses files from v0-project to v0-next-shadcn
Ensures both projects have the same improved versions
"""

import shutil
import os
from pathlib import Path

# Paths
SOURCE_PROJECT = Path("/vercel/share/v0-project")
TARGET_PROJECT = Path("/vercel/share/v0-next-shadcn")

FILES_TO_SYNC = [
    {
        "source": "src/pages/Licenses.tsx",
        "target": "src/pages/Licenses.tsx",
        "description": "Main Licenses page with all improvements"
    },
    {
        "source": "src/services/license.ts",
        "target": "src/services/license.ts",
        "description": "License service with AES-256-GCM encryption"
    }
]

def sync_files():
    """Synchronize files from source to target project"""
    
    print("=" * 60)
    print("LICENSES FILES SYNCHRONIZATION")
    print("=" * 60)
    print(f"\nSource: {SOURCE_PROJECT}")
    print(f"Target: {TARGET_PROJECT}\n")
    
    if not SOURCE_PROJECT.exists():
        print(f"ERROR: Source project not found: {SOURCE_PROJECT}")
        return False
    
    if not TARGET_PROJECT.exists():
        print(f"ERROR: Target project not found: {TARGET_PROJECT}")
        return False
    
    success_count = 0
    error_count = 0
    
    for file_config in FILES_TO_SYNC:
        source_file = SOURCE_PROJECT / file_config["source"]
        target_file = TARGET_PROJECT / file_config["target"]
        
        print(f"\n{'─' * 60}")
        print(f"File: {file_config['source']}")
        print(f"Description: {file_config['description']}")
        print(f"{'─' * 60}")
        
        # Check source exists
        if not source_file.exists():
            print(f"✗ Source file not found: {source_file}")
            error_count += 1
            continue
        
        # Create target directory if needed
        target_file.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            # Get file sizes
            source_size = source_file.stat().st_size
            target_size = target_file.stat().st_size if target_file.exists() else 0
            
            # Copy file
            shutil.copy2(source_file, target_file)
            new_size = target_file.stat().st_size
            
            print(f"✓ Synced successfully")
            print(f"  Source size: {source_size} bytes")
            print(f"  Target size (before): {target_size} bytes")
            print(f"  Target size (after): {new_size} bytes")
            success_count += 1
            
        except Exception as e:
            print(f"✗ Error copying file: {e}")
            error_count += 1
            continue
    
    # Summary
    print(f"\n{'=' * 60}")
    print(f"SYNCHRONIZATION SUMMARY")
    print(f"{'=' * 60}")
    print(f"✓ Successfully synced: {success_count} file(s)")
    print(f"✗ Errors: {error_count} file(s)")
    print(f"\nTotal: {success_count + error_count} file(s)")
    
    if error_count == 0:
        print("\n✓ All files synchronized successfully!")
        print("\nNext steps:")
        print("1. The Vite dev server will hot-reload the changes")
        print("2. Check browser for 'Licenses' page to load without errors")
        print("3. Verify all license functionality works correctly")
        return True
    else:
        print("\n✗ Some files failed to synchronize. Please check the errors above.")
        return False

if __name__ == "__main__":
    success = sync_files()
    exit(0 if success else 1)
