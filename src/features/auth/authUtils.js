const isObjectLike = (value) => Boolean(value && typeof value === 'object' && !Array.isArray(value));

const toNonEmptyString = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
};

const isLikelyUserPayload = (value) => {
  if (!isObjectLike(value)) return false;
  return (
    value.id !== undefined ||
    value.public_id !== undefined ||
    value.email !== undefined ||
    value.nome !== undefined ||
    value.roles !== undefined
  );
};

const resolveAuthPayload = (payload) => {
  if (!isObjectLike(payload)) return {};
  if (isObjectLike(payload.data)) {
    const nestedData = payload.data;
    if (
      nestedData.token !== undefined ||
      nestedData.access_token !== undefined ||
      nestedData.usuario !== undefined ||
      nestedData.user !== undefined ||
      isLikelyUserPayload(nestedData)
    ) {
      return nestedData;
    }
  }
  return payload;
};

const resolveAuthUser = (payload) => {
  if (!isObjectLike(payload)) return null;
  if (isObjectLike(payload.usuario)) return payload.usuario;
  if (isObjectLike(payload.user)) return payload.user;
  if (isLikelyUserPayload(payload)) return payload;
  return null;
};

export const normalizeAuthSession = (payload) => {
  const authPayload = resolveAuthPayload(payload);
  const user = resolveAuthUser(authPayload);
  const token =
    toNonEmptyString(authPayload.token) ??
    toNonEmptyString(authPayload.access_token) ??
    toNonEmptyString(authPayload.accessToken);
  const refreshToken =
    toNonEmptyString(authPayload.refresh_token) ?? toNonEmptyString(authPayload.refreshToken);
  const refreshExpiresAt =
    toNonEmptyString(authPayload.refresh_expires_at) ??
    toNonEmptyString(authPayload.refreshExpiresAt);
  const firstAccess = Boolean(user?.primeiro_acesso ?? user?.primeiroAcesso);

  return { payload: authPayload, user, token, refreshToken, refreshExpiresAt, firstAccess };
};

// Stubs para compatibilidade com AppLayout — master panel não usa módulos GL/TR
export const hasUserModulo = () => false;
export const getCurrentModuloFromPath = () => null;
export const getModuloDashboardPath = () => null;
export const getModuloDisplayName = () => '';
export const getDefaultDashboardPathForUser = () => '/master';
