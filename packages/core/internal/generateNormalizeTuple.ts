import * as fs from 'fs';
import * as path from 'path';

const MAX_PROPERTIES = 100;
function generateTypings(length: number) {
  function recursiveFixType(length: number, maxLength = length): string {

    return `${length > 1 ? `${recursiveFixType(length - 1, maxLength)};\n` : ''}type FixTuple${length - 1}<T> = T extends { ${Array.from({ length }, (_, i) => `${i}${i === length - 1 ? '' : '?'}: any`).join('; ')} }
  ? [${Array.from({ length }, (_, i) => `T[${i}]`).join(',')}]
  : ${length > 1 ? `FixTuple${length - 2}<T>` : 'never'}`;
  }
  function recursiveFixTypeStep(length: number, step = 0): string {
    const maxStep = Math.ceil(length / 10);
    const pad = ''.padStart((step + 1)*2, '  ');
    return `T extends { ${(10 * (maxStep-step))-10}: any }
${pad}? FixTuple${step === 0 ? (length - 1) : 10 * (maxStep-step)-1 }<T>
${pad}: ${step === maxStep - 1 ? 'never' : recursiveFixTypeStep(length, step + 1)}`;
  }
  return `${recursiveFixType(length)}
export type TupleIndexes = ${Array.from({ length }, (_, i) => i).join(' | ')};
export type NormalizeTuple<T> = ${recursiveFixTypeStep(length)};`;
}

fs.writeFileSync(path.resolve(__dirname, '../src/normalize-tuple.ts'), generateTypings(MAX_PROPERTIES));