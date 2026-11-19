const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID
const apiToken = process.env.CLOUDFLARE_API_TOKEN

if (!accountId || !databaseId || !apiToken) {
  throw new Error(
    'CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, and CLOUDFLARE_API_TOKEN must be configured before starting the API.',
  )
}

const d1Url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/d1/database/${encodeURIComponent(databaseId)}/query`

export async function query(text, values = []) {
  const sql = text.replace(/\$(\d+)/g, '?')

  const response = await fetch(d1Url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params: values }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Cloudflare D1 request failed (${response.status}): ${body}`)
  }

  const data = await response.json()
  if (!data.success || !Array.isArray(data.result) || data.result[0]?.success === false) {
    const message = data.errors?.[0]?.message ?? data.result?.[0]?.error ?? 'Cloudflare D1 query failed.'
    throw new Error(message)
  }

  const result = data.result[0]
  return {
    rows: result.results ?? [],
    rowCount: result.meta?.changes ?? result.results?.length ?? 0,
  }
}
