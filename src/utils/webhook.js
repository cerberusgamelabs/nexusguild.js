import crypto from 'node:crypto';

export function signWebhookBody(rawBody, signingKey) {
    return crypto
        .createHmac('sha256', signingKey)
        .update(rawBody)
        .digest('hex');
}

export function verifyWebhookSignature(rawBody, signature, signingKey) {
    if (!signature || !signingKey) return false;

    const expected = signWebhookBody(rawBody, signingKey);

    try {
        return crypto.timingSafeEqual(
            Buffer.from(expected),
            Buffer.from(signature)
        );
    } catch {
        return false;
    }
}
