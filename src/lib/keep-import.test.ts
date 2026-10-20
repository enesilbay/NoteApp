import { strToU8, zipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import { parseKeepFiles } from './keep-import'

const jsonFile = (name: string, data: unknown) => new File([JSON.stringify(data)], name, { type: 'application/json' })

describe('parseKeepFiles', () => {
  it('metin notunu renk, sabitleme ve tarihleriyle aktarır', async () => {
    const { notes, skipped } = await parseKeepFiles([
      jsonFile('a.json', {
        title: ' Alışveriş ',
        textContent: 'süt',
        color: 'YELLOW',
        isPinned: true,
        isArchived: false,
        createdTimestampUsec: 1_700_000_000_000_000,
        userEditedTimestampUsec: 1_700_000_100_000_000,
      }),
    ])
    expect(skipped).toBe(0)
    expect(notes).toEqual([
      {
        title: 'Alışveriş',
        content: 'süt',
        color: 'limon',
        is_pinned: true,
        is_archived: false,
        created_at: new Date(1_700_000_000_000).toISOString(),
        updated_at: new Date(1_700_000_100_000).toISOString(),
      },
    ])
  })

  it('listeleri onay işaretli satırlara, etiketleri #etikete çevirir', async () => {
    const { notes } = await parseKeepFiles([
      jsonFile('b.json', {
        title: 'Yapılacaklar',
        listContent: [
          { text: 'ekmek', isChecked: true },
          { text: 'yumurta', isChecked: false },
        ],
        labels: [{ name: 'Ev işleri' }],
      }),
    ])
    expect(notes[0].content).toBe('☑ ekmek\n☐ yumurta\n\n#Ev_işleri')
    expect(notes[0].color).toBeNull()
  })

  it('arşivlenmiş not sabitlenmiş sayılmaz', async () => {
    const { notes } = await parseKeepFiles([jsonFile('c.json', { title: 'x', isPinned: true, isArchived: true })])
    expect(notes[0]).toMatchObject({ is_pinned: false, is_archived: true })
  })

  it('çöp kutusundaki, boş ve bozuk dosyaları atlar; görselli notları sayar', async () => {
    const result = await parseKeepFiles([
      jsonFile('trash.json', { title: 'silinmiş', isTrashed: true }),
      jsonFile('empty.json', { title: '', textContent: '' }),
      new File(['{bozuk'], 'broken.json'),
      jsonFile('img.json', { title: 'foto', attachments: [{ filePath: 'x.jpg' }] }),
    ])
    expect(result.notes.map((n) => n.title)).toEqual(['foto'])
    expect(result.skipped).toBe(3)
    expect(result.withAttachments).toBe(1)
  })

  it('Takeout zip arşivinden yalnızca Keep klasöründeki json dosyalarını okur', async () => {
    const zip = zipSync({
      'Takeout/Keep/not1.json': strToU8(JSON.stringify({ title: 'bir', textContent: '1' })),
      'Takeout/Keep/not2.json': strToU8(JSON.stringify({ title: 'iki', textContent: '2' })),
      'Takeout/Keep/foto.jpg': new Uint8Array([1, 2, 3]),
      'Takeout/Drive/baska.json': strToU8(JSON.stringify({ title: 'drive' })),
    })
    const { notes } = await parseKeepFiles([new File([zip], 'takeout.zip')])
    expect(notes.map((n) => n.title).sort()).toEqual(['bir', 'iki'])
  })
})
