import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { readStorage, writeStorage } from '../utils/storage'
import type { StorageKey } from '../utils/storage'

/**
 * useState gibi çalışır, ek olarak değeri localStorage'da saklar.
 * `parse` kayıtlı değeri doğrular/dönüştürür; geçersizse `fallback` kullanılır.
 * Dönüştürülen değer ilk render'dan sonra yeni formatta geri yazılır.
 */
export function useLocalStorage<T>(
  key: StorageKey,
  fallback: T,
  parse: (value: unknown) => T | null,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStorage(key, fallback, parse))

  useEffect(() => {
    writeStorage(key, value)
  }, [key, value])

  return [value, setValue]
}
