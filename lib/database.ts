import { db as database } from '../src/services/db';
import { Product as ProductType, Shop as ShopType, User as UserType, Invoice as InvoiceType, Deposit as DepositType, Withdrawal as WithdrawalType, Supply as SupplyType, Sale as SaleType, ActivityLog as ActivityLogType } from '../src/types';

export const db = database;
export type Product = ProductType;
export type Shop = ShopType;
export type User = UserType;
export type Invoice = InvoiceType;
export type Deposit = DepositType;
export type Withdrawal = WithdrawalType;
export type Supply = SupplyType;
export type Sale = SaleType;
export type ActivityLog = ActivityLogType;
