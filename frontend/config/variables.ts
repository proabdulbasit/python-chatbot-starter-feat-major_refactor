// NOTE: Use a cheaper/faster model like gpt-3.5-turbo
//Temperature(0-1). Increase to boost creativity and response randomness.
export const QUESTION_GENERATOR_CHAIN_MODEL = 'gpt-3.5-turbo';
export const QUESTION_GENERATOR_CHAIN_TEMPERATURE = 0;

// NOTE: You can change to use a powerful model like gpt-4
export const QA_CHAIN_MODEL = 'gpt-3.5-turbo';
export const QA_CHAIN_TEMPERATURE = 0;

//NOTE: Change the number of source documents used by the model to generate a response and displayed in the UI
export const SOURCE_DOCUMENTS_TOTAL = 4
