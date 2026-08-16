#!/usr/bin/env node
import { sifreHashle } from "./sifre-hash.mjs";

const sifre = process.argv[2];
if (!sifre) {
  console.error("Kullanım: node scripts/hash-sifre.mjs 'sifre'");
  process.exit(1);
}

console.log(sifreHashle(sifre));
