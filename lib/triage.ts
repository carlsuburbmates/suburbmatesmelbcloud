export function scanContent(text: string): { flagged: boolean; reason?: string } {
    const forbidden = ['spam', 'buy crypto', 'casino', 'free money'];
    const lower = text.toLowerCase();

    for (const word of forbidden) {
        if (lower.includes(word)) {
            return { flagged: true, reason: `Contains forbidden keyword: ${word}` };
        }
    }
    return { flagged: false };
}
