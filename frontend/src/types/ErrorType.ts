export type RequestError = {
  response?: {
    data?: {
      error?: string;
      message?: string;
    };
  };
  message?: string;
};

export const getRequestErrorMessage = (
  error: unknown,
  fallbackMessage = 'Hubo un error al procesar el formulario.'
): string => {
  if (typeof error !== 'object' || error === null) {
    return fallbackMessage;
  }

  const requestError = error as RequestError;
  return (
    requestError.response?.data?.error ??
    requestError.response?.data?.message ??
    requestError.message ??
    fallbackMessage
  );
};
