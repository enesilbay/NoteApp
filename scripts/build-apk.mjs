// Web'i derler, Android projesine aktarır, imzalı release APK'yı üretir ve downloads/ klasörüne koyar.
// `npm run deploy` bu klasörü sitenin /downloads adresine yükler.
import { execSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const run = (cmd, cwd = '.') => execSync(cmd, { cwd, stdio: 'inherit' })
const gradlew = `"${resolve('android', process.platform === 'win32' ? 'gradlew.bat' : 'gradlew')}"`

// Telefonlar güncellemeyi yalnızca daha yüksek versionCode ile kabul eder; her derlemede bir artır
const gradleFile = 'android/app/build.gradle'
let gradle = readFileSync(gradleFile, 'utf8')
const code = Number(/versionCode (\d+)/.exec(gradle)[1]) + 1
gradle = gradle.replace(/versionCode \d+/, `versionCode ${code}`).replace(/versionName "[^"]*"/, `versionName "1.${code}"`)
writeFileSync(gradleFile, gradle)
console.log(`Sürüm: 1.${code} (versionCode ${code})`)

run('npm run build')
run('npx cap sync android')
run(`${gradlew} assembleRelease`, 'android')
mkdirSync('downloads', { recursive: true })
copyFileSync('android/app/build/outputs/apk/release/app-release.apk', 'downloads/notea-plus.apk')
console.log('\nAPK hazır: downloads/notea-plus.apk')
