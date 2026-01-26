/**
 * Convert snake_case keys to camelCase
 * @param {Object|Array} data - Data to convert
 * @returns {Object|Array} - Converted data
 */
function snakeToCamel(data) {
    if (data === null || data === undefined) {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => snakeToCamel(item));
    }

    if (typeof data !== 'object') {
        return data;
    }

    const converted = {};
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            const value = data[key];
            
            // Recursively convert nested objects
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                converted[camelKey] = snakeToCamel(value);
            } else if (Array.isArray(value)) {
                converted[camelKey] = value.map(item => 
                    typeof item === 'object' ? snakeToCamel(item) : item
                );
            } else {
                converted[camelKey] = value;
            }
        }
    }
    return converted;
}

/**
 * Convert camelCase keys to snake_case
 * @param {Object|Array} data - Data to convert
 * @returns {Object|Array} - Converted data
 */
function camelToSnake(data) {
    if (data === null || data === undefined) {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(item => camelToSnake(item));
    }

    if (typeof data !== 'object') {
        return data;
    }

    const converted = {};
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            const value = data[key];
            
            // Recursively convert nested objects
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                converted[snakeKey] = camelToSnake(value);
            } else if (Array.isArray(value)) {
                converted[snakeKey] = value.map(item => 
                    typeof item === 'object' ? camelToSnake(item) : item
                );
            } else {
                converted[snakeKey] = value;
            }
        }
    }
    return converted;
}

module.exports = {
    snakeToCamel,
    camelToSnake
};
