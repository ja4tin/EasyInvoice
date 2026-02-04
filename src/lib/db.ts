/**
 * Project: EasyInvoice
 * File: db.ts
 * Description: IndexedDB 操作封装
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import { get, set, del } from 'idb-keyval';

export const db = {
  get,
  set,
  del,
};
