/**
 * `offhook phone <provision | connect | status | release>` — go from zero to a
 * real number answering, in a couple of commands.
 *   provision  buy a number + provider SIP trunk, pointed at LiveKit
 *   connect    create the LiveKit inbound trunk + dispatch → the agent answers it
 *   status     show the provisioned state
 *   release    tear it all down (number, trunks, dispatch)
 *
 * Needs a Twilio account (provision) + LiveKit creds (connect). Telnyx is the
 * fast-follow (same TelephonyClient interface).
 */
import { loadAgentConfig } from '../config/agent-config.js';
import { createTwilioClient } from '../telephony/twilio.js';
import { liveKitSipFromEnv } from '../telephony/livekit.js';
import { loadTelephonyState } from '../telephony/state.js';
import { provisionNumber, connectNumber, releaseNumber } from '../telephony/orchestrate.js';

function fail(e: unknown): void {
  console.log(`✗ ${e instanceof Error ? e.message : String(e)}`);
  process.exitCode = 1;
}

export async function phoneCommand(configPath: string, args: string[]): Promise<void> {
  const sub = args[0];
  const agentId = loadAgentConfig(configPath).agent.id;
  const agentName = process.env.OFFHOOK_AGENT_NAME || 'offhook';

  if (sub === 'provision') {
    const livekitSipUri = process.env.LIVEKIT_SIP_URI;
    if (!livekitSipUri) {
      console.log('Set LIVEKIT_SIP_URI to your LiveKit SIP endpoint first (e.g. sip:xxxx.sip.livekit.cloud).');
      process.exitCode = 1;
      return;
    }
    const ai = args.indexOf('--area-code');
    const areaCode = ai >= 0 ? args[ai + 1] : undefined;
    console.log(`Provisioning a number${areaCode ? ` in area code ${areaCode}` : ''} via Twilio…`);
    try {
      const state = await provisionNumber({ client: createTwilioClient(), livekitSipUri, agentId, ...(areaCode ? { areaCode } : {}) });
      console.log(`✓ ${state.phoneNumber} provisioned. Next: offhook phone connect`);
    } catch (e) { fail(e); }
    return;
  }

  if (sub === 'connect') {
    try {
      const state = await connectNumber({ sip: liveKitSipFromEnv(), agentId, agentName });
      console.log(`✓ ${state.phoneNumber} now answers via offhook (agent "${agentName}"). Start the worker: offhook start`);
    } catch (e) { fail(e); }
    return;
  }

  if (sub === 'status') {
    const s = loadTelephonyState();
    console.log(s ? JSON.stringify(s, null, 2) : 'No telephony set up yet. Run: offhook phone provision');
    return;
  }

  if (sub === 'release') {
    try {
      await releaseNumber({ client: createTwilioClient(), sip: liveKitSipFromEnv() });
      console.log('✓ number + trunks released.');
    } catch (e) { fail(e); }
    return;
  }

  console.log('Usage: offhook phone <provision [--area-code NNN] | connect | status | release>');
  process.exitCode = 1;
}
