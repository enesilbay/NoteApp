// Web'i derler, Android projesine aktarır, imzalı release APK'yı üretir ve downloads/ klasörüne koyar.
// `npm run deploy` bu klasörü sitenin /downloads adresine yükler.
import { execSync } from 'node:child_process'
import { copyFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const run = (cmd, cwd = '.') => execSync(cmd, { cwd, stdio: 'inherit' })
const gradlew = `"${resolve('android', process.platform === 'win32' ? 'gradlew.bat' : 'gradlew')}"`

run('npm run build')
run('npx cap sync android')
run(`${gradlew} assembleRelease`, 'android')
mkdirSync('downloads', { recursive: true })
copyFileSync('android/app/build/outputs/apk/release/app-release.apk', 'downloads/notea-plus.apk')
console.log('\nAPK hazır: downloads/notea-plus.apk')
