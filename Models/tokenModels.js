
let tokens = [];

module.exports = {
    getTokens: () => tokens,
    addToken: (token) => {
        // Avoid duplicates
        if (!tokens.includes(token)) {
            tokens.push(token);
        }
        return tokens;
    }
};
