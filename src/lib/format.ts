const relative = new Intl.RelativeTimeFormat('tr', { numeric: 'auto' })
const dateTime = new Intl.DateTimeFormat('tr', { dateStyle: 'medium', timeStyle: 'short' })

/** "az önce", "5 dakika önce", "dün" … bir haftadan eskiyse tam tarih. */
export function formatEdited(iso: string) {
  const diffSec = Math.round((new Date(iso).getTime() - Date.now()) / 1000)
  const abs = Math.abs(diffSec)
  if (abs < 60) return 'az önce'
  if (abs < 3600) return relative.format(Math.round(diffSec / 60), 'minute')
  if (abs < 86400) return relative.format(Math.round(diffSec / 3600), 'hour')
  if (abs < 7 * 86400) return relative.format(Math.round(diffSec / 86400), 'day')
  return dateTime.format(new Date(iso))
}
