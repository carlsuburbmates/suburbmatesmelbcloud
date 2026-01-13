/**
 * ABN Validation Utility (Luhn-like Checksum)
 * 
 * An ABN (Australian Business Number) is a unique 11-digit identifier.
 * The validation involves a specific weighting and modulo 89 check.
 */

export interface ABNValidationResult {
    isValid: boolean;
    message?: string;
    formatted?: string;
}

/**
 * Validates an Australian Business Number (ABN)
 * @param abn The ABN string to validate
 */
export function validateABN(abn: string): ABNValidationResult {
    // 1. Remove non-numeric characters
    const cleanABN = abn.replace(/\D/g, '');

    // 2. Length check (Must be 11 digits)
    if (cleanABN.length !== 11) {
        return {
            isValid: false,
            message: 'ABN must be exactly 11 digits'
        };
    }

    // 3. Algorithm:
    // a) Subtract 1 from the first digit
    // b) Multiply each of the digits by its weighting
    // c) Sum the products
    // d) Divide by 89, if remainder is 0 then valid

    const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    const digits = cleanABN.split('').map(Number);

    // Subtract 1 from the first digit
    digits[0] -= 1;

    const sum = digits.reduce((acc, digit, idx) => {
        return acc + (digit * weights[idx]);
    }, 0);

    const isValid = sum % 89 === 0;

    if (!isValid) {
        return {
            isValid: false,
            message: 'ABN checksum validation failed'
        };
    }

    // Format as 00 000 000 000
    const formatted = `${cleanABN.substring(0, 2)} ${cleanABN.substring(2, 5)} ${cleanABN.substring(5, 8)} ${cleanABN.substring(8, 11)}`;

    return {
        isValid: true,
        formatted
    };
}

/**
 * Authoritative Lookup (Mock for now, as real lookup requires ABR setup)
 * In PR11+, this would hit the ABR API.
 */
export async function lookupABN(abn: string): Promise<ABNValidationResult & { entityName?: string }> {
    const localCheck = validateABN(abn);
    if (!localCheck.isValid) return localCheck;

    // Mock Success for valid checksums
    // In reality, we'd check if the ABN is "Active"
    return {
        ...localCheck,
        entityName: 'Verified Business Entity' // Placeholder
    };
}
