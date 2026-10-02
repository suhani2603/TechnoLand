/**
 * Amazon Bedrock helper — invokes Claude Sonnet with a GIS context prompt.
 *
 * Phase 1 (mock mode): returns a canned response after a simulated delay.
 * Phase 2 (AWS): calls the Bedrock InvokeModelWithResponseStream API.
 *
 * TODO (Phase 2):
 *   npm install @aws-sdk/client-bedrock-runtime
 *   Enable Claude 3.5 Sonnet model access in Bedrock console (us-east-1).
 *   Uncomment the real implementation below.
 */

const MOCK_MODE = process.env.USE_MOCK !== 'false'

// Claude model ID — update to latest available Sonnet when connecting
const MODEL_ID = 'anthropic.claude-3-5-sonnet-20241022-v2:0'

const MOCK_RESPONSES = [
  'Based on the parcel attributes provided, this land shows **high agricultural potential**. The loamy soil composition and annual rainfall of ~1,250 mm are well-suited for root crops and cereals.\n\n**Recommended crops:** Maize, Sorghum, Soybean\n\n**Key considerations:**\n- Slope gradient under 5% minimises erosion risk\n- Proximity to seasonal water body offers supplemental irrigation\n- Current fallow status suggests soil fertility may have recovered',

  'The infrastructure data shows **good road connectivity** within 2 km, critical for market access. A feeder road runs along the eastern boundary.\n\n**Development recommendations:**\n1. Conduct soil test before committing to a cash crop\n2. Install boundary markers to prevent encroachment\n3. Consider a smallholder cooperative model given the parcel size\n\n**Nearest market:** ~14 km via primary road',

  'Looking at the regional agricultural zone overlay, this parcel sits in a **High Suitability** zone for rain-fed agriculture.\n\n**Water access:** 1.4 km to nearest river; groundwater depth estimated 12–18 m.\n\n**Risk factors:**\n- Northern exposure increases dry-season wind — consider windbreaks\n- Clay content may cause waterlogging in peak rainfall months',
]

/**
 * Generate an AI response to a user message, given GIS feature context.
 *
 * @param {string} userMessage
 * @param {object|null} featureContext - Properties of the selected GIS feature.
 * @returns {Promise<{reply: string, model: string}>}
 */
async function generateResponse(userMessage, featureContext) {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600))
    return {
      reply: MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)],
      model: 'mock',
    }
  }

  // ── Real AWS Bedrock implementation (Phase 2) ──────────────────────────────
  // const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime')
  //
  // const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' })
  //
  // const systemPrompt = buildSystemPrompt(featureContext)
  //
  // const payload = {
  //   anthropic_version: 'bedrock-2023-05-31',
  //   max_tokens: 1024,
  //   system: systemPrompt,
  //   messages: [{ role: 'user', content: userMessage }],
  // }
  //
  // const command = new InvokeModelCommand({
  //   modelId: MODEL_ID,
  //   body: JSON.stringify(payload),
  //   contentType: 'application/json',
  //   accept: 'application/json',
  // })
  //
  // const response = await client.send(command)
  // const result = JSON.parse(Buffer.from(response.body).toString('utf-8'))
  // return {
  //   reply: result.content[0].text,
  //   model: MODEL_ID,
  // }
  // ──────────────────────────────────────────────────────────────────────────

  throw new Error('Real Bedrock integration not yet implemented — set USE_MOCK=true')
}

/**
 * Build the system prompt that gives Claude context about the selected parcel.
 * @param {object|null} featureContext
 */
function buildSystemPrompt(featureContext) {
  const base = `You are TechnoLand AI, an expert GIS-based land and agriculture decision-support assistant.
You help rural planners, agronomists, and land administrators make data-driven decisions.
Your responses are concise, practical, and grounded in the provided spatial data.
Use **bold** for key terms and headings. Keep responses under 300 words unless the user asks for detail.`

  if (!featureContext) return base

  const contextBlock = Object.entries(featureContext)
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n')

  return `${base}

The user has selected a land feature with these attributes:
${contextBlock}

Use these attributes as the primary context when answering. If the question is unrelated to this land feature, still answer helpfully.`
}

module.exports = { generateResponse }
