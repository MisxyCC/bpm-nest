// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default tseslint.config(
  // 1. Global Ignores: โฟลเดอร์ที่ไม่ต้องตรวจสอบ
  {
    ignores: ['eslint.config.mjs', 'dist', 'node_modules', 'coverage', '**/*.spec.ts'],
  },

  // 2. Base Configuration: ใช้ Config พื้นฐานที่ดีที่สุด
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic, // เพิ่มกฎเกี่ยวกับ Stylistic (เช่น การเว้นวรรค array)

  // 3. Main Configuration Block
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        project: './tsconfig.json', // เชื่อมกับ TypeScript Config เพื่อ Type-aware linting
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'module',
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },
    rules: {
      // --- NestJS & TypeScript Specific Rules ---
      
      // อนุญาตให้ตั้งชื่อ Interface โดยไม่ต้องมี prefix 'I' (ตามสไตล์ NestJS สมัยใหม่)
      '@typescript-eslint/interface-name-prefix': 'off',
      
      // บังคับให้ระบุ Return Type ชัดเจน (แนะนำให้เปิดเป็น warn/error ใน NestJS เพื่อความชัดเจนของ API)
      '@typescript-eslint/explicit-function-return-type': 'off', 
      
      // อนุญาตให้ใช้ explicit boundary types (ช่วยเรื่อง performance ของ TS compiler)
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      
      // ห้ามใช้ 'any' โดยเด็ดขาด (Strict Mode)
      '@typescript-eslint/no-explicit-any': 'off',
      
      // ปิดกฎ unused-vars ของ default และใช้ของ typescript แทน เพื่อป้องกัน error ซ้อนทับ
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { 
          argsIgnorePattern: '^_', // ตัวแปรที่ขึ้นต้นด้วย _ จะไม่ฟ้อง error (เช่น _req)
          varsIgnorePattern: '^_' 
        },
      ],

      // --- Import Sorting & Cleanup (High Quality of Life) ---
      
      // เรียง Import อัตโนมัติ: Built-in -> Third Party -> Internal -> Relative
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      
      // ลบ Import ที่ไม่ได้ใช้ออกอัตโนมัติ
      'unused-imports/no-unused-imports': 'error',

      // --- Formatting & Style ---
      
      // ป้องกัน Error เรื่อง console.log (ควรใช้ Logger ของ NestJS แทนใน Production)
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // 4. Prettier Integration (ต้องอยู่ท้ายสุดเสมอ)
  prettierPlugin,
);