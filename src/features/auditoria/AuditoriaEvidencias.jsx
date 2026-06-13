import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Article,
  ContentCopy,
  Download,
  FactCheck,
  History,
  Search,
  Security,
  Verified,
} from '@mui/icons-material';
import {
  baixarEvidenciaCarimboTst,
  formatApiError,
  getEvidenciaBySessao,
  validarEvidenciaCarimboBry,
  getApiCode
} from '../../services/api/ApiService';
import { useTranslation } from 'react-i18next';
import '../../app/i18n';

const safeParseJson = (value) => {
  if (!value || typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
};

const firstDefined = (...values) => values.find((value) => value !== undefined && value !== null && value !== '');

const findDeepValue = (source, keys) => {
  if (!source || typeof source !== 'object') return undefined;
  const queue = [source];
  const visited = new Set();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object' || visited.has(current)) continue;
    visited.add(current);

    for (const key of keys) {
      if (current[key] !== undefined && current[key] !== null && current[key] !== '') {
        return current[key];
      }
    }

    Object.values(current).forEach((value) => {
      if (value && typeof value === 'object') queue.push(value);
    });
  }

  return undefined;
};

const normalizeEvidenceResponse = (payload) => {
  const data = payload?.data ?? payload ?? {};
  const root = data?.evidencia ?? data?.evidence ?? data;
  const snapshot =
    root?.snapshot ??
    root?.evidencia_snapshot ??
    root?.evidenciaSnapshot ??
    (root?.evidencia_snapshot_id ? root : null);
  const carimbo =
    root?.carimbo ??
    root?.evidencia_carimbo ??
    root?.evidenciaCarimbo ??
    root?.timestamp ??
    root?.timestamp_bry ??
    root?.evidencia_carimbo_bry ??
    root?.evidenciaCarimboBry ??
    null;
  const job =
    root?.job ??
    root?.carimbo_job ??
    root?.evidencia_carimbo_job ??
    root?.evidenciaCarimboJob ??
    null;

  return { root, snapshot, carimbo, job };
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('pt-BR');
};

const formatYesNo = (value, t) => {
  if (value === true) return t('evidences.messages.yes');
  if (value === false) return t('evidences.messages.no');
  return value;
};

const normalizeParticipants = (items = []) => {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => ({
    id: firstDefined(item?.funcionario_id, item?.id, item?.public_id, index + 1),
    nome: item?.nome,
    cpf: item?.cpf,
    nfc: item?.nfc,
    setor: firstDefined(item?.setor?.nome, item?.setor_nome, item?.setor),
    nivel: firstDefined(item?.setor?.nivel, item?.nivel),
    metodo: firstDefined(item?.presencas?.[0]?.metodo, item?.metodo),
    horario: firstDefined(item?.presencas?.[0]?.horario_registro, item?.horario_registro),
  }));
};

const formatBryValidationStatus = (value, t) => {
  if (value === true) return t('evidences.messages.valid');
  if (value === false) return t('evidences.messages.notValidated');
  if (typeof value === 'number' && value >= 200 && value < 300) return t('evidences.messages.concluded');
  const normalized = String(value ?? '').trim();
  if (!normalized) return '-';
  const lower = normalized.toLowerCase();
  if (['valid', 'valido', 'validado', 'válido', 'success', 'sucesso', 'approved', 'aprovado', 'ok'].includes(lower)) {
    return t('evidences.messages.valid');
  }
  if (['invalid', 'invalido', 'inválido', 'failed', 'erro', 'error', 'rejected', 'rejeitado'].includes(lower)) {
    return t('evidences.messages.notValidated');
  }
  return normalized;
};

const getFirstArrayItem = (value) => {
  const parsedValue = safeParseJson(value);
  return Array.isArray(parsedValue) ? parsedValue[0] : undefined;
};


const toDisplayText = (value, indent = 0) => {
  if (value === null || value === undefined || value === '') return '-';
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return value
      .map((item) => {
        const prefix = `${' '.repeat(indent)}- `;
        if (item && typeof item === 'object') {
          return `${prefix}${toDisplayText(item, indent + 2).trimStart()}`;
        }
        return `${prefix}${String(item)}`;
      })
      .join('\n');
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return '{}';
    return entries
      .map(([key, item]) => {
        const prefix = `${' '.repeat(indent)}${key}:`;
        if (item && typeof item === 'object') {
          return `${prefix}\n${toDisplayText(item, indent + 2)}`;
        }
        return `${prefix} ${item === null || item === undefined || item === '' ? '-' : String(item)}`;
      })
      .join('\n');
  }
  return String(value);
};

const JsonViewer = ({ value, minRows = 6 }) => {
  const { t } = useTranslation();
  const [format, setFormat] = useState('friendly');
  const parsedValue = safeParseJson(value);
  const textValue = format === 'json'
    ? JSON.stringify(parsedValue ?? null, null, 2)
    : toDisplayText(parsedValue);

  return (
    <Stack spacing={1.5}>
      <TextField
        select
        size="small"
        label={t("evidences.components.cards.validate.evidencePayload.visualizationField", { defaultValue: 'Visualização' })}
        value={format}
        onChange={(event) => setFormat(event.target.value)}
        sx={{ width: { xs: '100%', sm: 180 } }}
      >
        <MenuItem value="friendly">{t('evidences.components.jsonViewer.simple', { defaultValue: 'Simples' })}</MenuItem>
        <MenuItem value="json">JSON</MenuItem>
      </TextField>
      <TextField
        value={textValue}
        multiline
        minRows={minRows}
        maxRows={22}
        fullWidth
        InputProps={{
          readOnly: true,
          sx: {
            alignItems: 'flex-start',
            fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
            fontSize: '0.82rem',
            lineHeight: 1.55,
          },
        }}
      />
    </Stack>
  );
};

const Field = ({ label, value, mono = false }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        fontFamily: mono ? '"SFMono-Regular", Consolas, "Liberation Mono", monospace' : 'inherit',
        overflowWrap: 'anywhere',
        color: value ? 'text.primary' : 'text.secondary',
      }}
    >
      {value || '-'}
    </Typography>
  </Box>
);

const Section = ({ icon: Icon, title, action, children }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, md: 3 },
      borderRadius: 2,
      border: '1px solid rgba(255,255,255,0.08)',
      bgcolor: 'background.paper',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Icon sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Box>
      {action}
    </Box>
    {children}
  </Paper>
);

const downloadBlob = (data, filename) => {
  const blob = data instanceof Blob ? data : new Blob([data]);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

function AuditoriaEvidencias() {
  const { t } = useTranslation();

  const buildBryRequestSummary = (request, fallback) => {
    const parsedRequest = safeParseJson(request) || safeParseJson(fallback) || {};
    const timestamps = Array.isArray(parsedRequest?.timestamps) ? parsedRequest.timestamps : [];
    const firstTimestamp = timestamps[0] || getFirstArrayItem(findDeepValue(parsedRequest, ['timestamps'])) || {};

    return [
      {
        label: t('evidences.components.cards.validate.sendedCard.hashSubtitle', { defaultValue: 'Hash enviado' }),
        value: firstDefined(firstTimestamp?.documentHash, parsedRequest?.documentHash, findDeepValue(parsedRequest, ['documentHash', 'document_hash'])),
        mono: true,
      },
      {
        label: t('evidences.components.cards.validate.sendedCard.tokenSubtitle', { defaultValue: 'Token enviado' }),
        value: firstDefined(firstTimestamp?.content, parsedRequest?.content, findDeepValue(parsedRequest, ['content', 'timestamp_token'])),
        mono: true,
      },
    ];
  };

  const buildBryResponseSummary = (response) => {
    const parsedResponse = safeParseJson(response) || {};
    const reports = Array.isArray(parsedResponse?.reports)
      ? parsedResponse.reports
      : findDeepValue(parsedResponse, ['reports']);
    const firstReport = Array.isArray(reports) ? reports[0] : reports;
    const timeStampStatus =
      firstReport?.timeStampStatus ||
      parsedResponse?.timeStampStatus ||
      findDeepValue(parsedResponse, ['timeStampStatus']) ||
      {};
    const certificate = Array.isArray(timeStampStatus?.timestampChainStatus?.certificateStatusList)
      ? timeStampStatus.timestampChainStatus.certificateStatusList[0]
      : {};
    const certificateInfo = certificate?.certificateInfo || {};
    const result = firstDefined(
      timeStampStatus?.status,
      parsedResponse?.valid,
      parsedResponse?.isValid,
      parsedResponse?.validated,
      parsedResponse?.success,
      findDeepValue(parsedResponse, ['valid', 'isValid', 'validated', 'success', 'status'])
    );

    return [
      {
        label: t("evidences.components.cards.validate.resultCard.resultSubtitle", { defaultValue: 'Resultado' }),
        value: formatBryValidationStatus(result, t),
      },
      {
        label: t("evidences.components.cards.validate.resultCard.stampHourSubtitle", { defaultValue: 'Horário do carimbo' }),
        value: formatDateTime(firstDefined(
          timeStampStatus?.timeStampDate,
          parsedResponse?.timeStampDate,
          parsedResponse?.timestamp,
          findDeepValue(parsedResponse, ['timeStampDate', 'timestamp', 'genTime'])
        )),
      },
      {
        label: t("evidences.components.cards.validate.resultCard.validationHashSubtitle", { defaultValue: 'Hash validado' }),
        value: firstDefined(
          timeStampStatus?.timeStampContentHash,
          parsedResponse?.timeStampContentHash,
          findDeepValue(parsedResponse, ['timeStampContentHash'])
        ),
        mono: true,
      },
      {
        label: t("evidences.components.cards.validate.resultCard.algorithmSubtitle", { defaultValue: 'Algoritmo' }),
        value: firstDefined(
          timeStampStatus?.timeStampContentHashAlgorithm,
          parsedResponse?.timeStampContentHashAlgorithm,
          findDeepValue(parsedResponse, ['timeStampContentHashAlgorithm'])
        ),
      },
      {
        label: t("evidences.components.cards.validate.resultCard.stampNumberSubtitle", { defaultValue: 'Número do carimbo' }),
        value: firstDefined(
          timeStampStatus?.timestampSerialNumber,
          parsedResponse?.timestampSerialNumber,
          findDeepValue(parsedResponse, ['timestampSerialNumber'])
        ),
      },
      {
        label: t("evidences.components.cards.validate.resultCard.issuerSubtitle", { defaultValue: 'Emissor' }),
        value: firstDefined(
          certificateInfo?.subjectDN?.formattedCn,
          certificateInfo?.subjectDN?.cn,
          findDeepValue(parsedResponse, ['formattedCn', 'issuerName', 'emissor'])
        ),
      },
    ].filter((item) => item.value !== undefined && item.value !== null && item.value !== '' && item.value !== '-');
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSessaoId = searchParams.get('sessao_id') || searchParams.get('sessaoId') || '';
  const [sessaoId, setSessaoId] = useState(initialSessaoId);
  const [evidence, setEvidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bryValidation, setBryValidation] = useState(null);
  const [actionLoading, setActionLoading] = useState('');
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });
  const [payloadSection, setPayloadSection] = useState('completo');

  const { snapshot, carimbo, job } = evidence || {};
  const snapshotPayload = useMemo(() => safeParseJson(snapshot?.payload) || {}, [snapshot]);
  const sessao = snapshotPayload?.sessao || snapshotPayload?.session || {};
  const treinamento =
    snapshotPayload?.treinamento ||
    snapshotPayload?.training ||
    sessao?.treinamento ||
    sessao?.training ||
    {};
  const empresa = snapshotPayload?.empresa || sessao?.empresa || {};
  const unidade = snapshotPayload?.unidade || sessao?.unidade || {};
  const instrutor = snapshotPayload?.instrutor || snapshotPayload?.facilitador || sessao?.instrutor || {};
  const participantes = Array.isArray(snapshotPayload?.participantes)
    ? snapshotPayload.participantes
    : Array.isArray(sessao?.participantes)
      ? sessao.participantes
      : [];
  const participantRows = useMemo(() => normalizeParticipants(participantes), [participantes]);

  const snapshotId = firstDefined(snapshot?.evidencia_snapshot_id, snapshot?.id, snapshot?.snapshot_id);
  const carimboId = firstDefined(carimbo?.evidencia_carimbo_id, carimbo?.id, carimbo?.carimbo_id);
  const token = firstDefined(carimbo?.timestamp_token, carimbo?.timestampToken, carimbo?.content);
  const hash = firstDefined(snapshot?.payload_hash, snapshot?.payloadHash, carimbo?.document_hash, carimbo?.documentHash);
  const validationRequest = firstDefined(
    bryValidation?.validation_request,
    bryValidation?.validationRequest,
    bryValidation?.request,
    bryValidation?.data?.validation_request,
    bryValidation?.data?.request,
    carimbo?.validation_request,
    carimbo?.validationRequest
  );
  const validationResponse = firstDefined(
    bryValidation?.validation_response,
    bryValidation?.validationResponse,
    bryValidation?.response,
    bryValidation?.data?.validation_response,
    bryValidation?.data?.response,
    carimbo?.validation_response,
    carimbo?.validationResponse
  );
  const validationRequestFallback = {
    contentReturn: true,
    mode: 'BASIC',
    nonce: firstDefined(carimbo?.nonce, 1),
    timestamps: [
      {
        content: token || '',
        documentHash: hash || '',
        nonce: firstDefined(carimbo?.nonce, 1),
      },
    ],
  };
  const bryRequestSummary = buildBryRequestSummary(
    validationRequest || bryValidation?.request,
    validationRequestFallback
  );
  const bryResponseSummary = buildBryResponseSummary(validationResponse || bryValidation?.response || bryValidation);
  const payloadSections = useMemo(() => {
    const sections = [{ value: 'completo', label: t("evidences.messages.labelComplete"), data: snapshotPayload }];
    Object.entries(snapshotPayload || {}).forEach(([key, value]) => {
      if (value && typeof value === 'object') {
        sections.push({ value: key, label: key.replace(/_/g, ' '), data: value });
      }
    });
    return sections;
  }, [snapshotPayload]);
  const selectedPayloadSection = payloadSections.find((item) => item.value === payloadSection) || payloadSections[0];

  const showFeedback = (message, severity = 'success') => {
    setFeedback({ open: true, message, severity });
  };

  const loadEvidence = async (value = sessaoId) => {
    const cleanValue = String(value || '').trim();
    if (!cleanValue) {
      setError(t("evidences.messages.not_id_session"));
      return;
    }

    try {
      setLoading(true);
      setError('');
      setBryValidation(null);
      const response = await getEvidenciaBySessao(cleanValue);
      setEvidence(normalizeEvidenceResponse(response.data));
      setSearchParams({ sessao_id: cleanValue });
    } catch (err) {
      setEvidence(null);
      const code = getApiCode(err);
      setError(code ? t(`evidences.api_codes.${code}`, { defaultValue: formatApiError(err) }) : formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialSessaoId) {
      loadEvidence(initialSessaoId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    loadEvidence();
  };

  const handleValidateBry = async () => {
    if (!carimboId) return;
    try {
      setActionLoading('bry');
      const response = await validarEvidenciaCarimboBry(carimboId);
      const normalizedResponse = normalizeEvidenceResponse(response.data);
      const nextCarimbo = normalizedResponse.carimbo || response.data?.carimbo || response.data?.data?.carimbo;
      setBryValidation(response.data);
      showFeedback(t("evidences.messages.bryValidatedConcluded"));
      setEvidence((current) => ({
        ...current,
        carimbo: {
          ...current?.carimbo,
          ...nextCarimbo,
        },
      }));
    } catch (err) {
      const code = getApiCode(err);
      showFeedback(code ? t(`evidences.api_codes.${code}`, { defaultValue: formatApiError(err) }) : formatApiError(err), 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleDownloadTst = async () => {
    if (!carimboId) return;
    try {
      setActionLoading('download');
      const response = await baixarEvidenciaCarimboTst(carimboId);
      downloadBlob(response.data, `carimbo-sessao-${sessaoId || snapshot?.sessao_id || snapshotId}.tst`);
      showFeedback(t("evidences.messages.tstFileGenerated"));
    } catch (err) {
      const code = getApiCode(err);
      showFeedback(code ? t(`evidences.api_codes.${code}`, { defaultValue: formatApiError(err) }) : formatApiError(err), 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleCopy = async (value, label) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(String(value));
      showFeedback(`${label} ${t("evidences.messages.labelCopied")}.`);
    } catch (error) {
      showFeedback(t("evidences.messages.couldNotCopyContent"), 'error');
    }
  };

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          {t("evidences.components.title")}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 900 }}>
          {t("evidences.components.subtitle")}  
        </Typography>
      </Box>

      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          mb: 3,
          borderRadius: 2,
          border: '1px solid rgba(255,255,255,0.08)',
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <TextField
            fullWidth
            label={t("evidences.components.sessionField")}
            value={sessaoId}
            onChange={(event) => setSessaoId(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress color="inherit" size={18} /> : <Search />}
            disabled={loading}
            sx={{ minWidth: { xs: '100%', md: 160 }, height: 56 }}
          >
            {t("evidences.components.searchButton")}
          </Button>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!evidence && !loading && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {t("evidences.components.warningBox")}  
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 6 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t("evidences.components.loadingText")}
          </Typography>
        </Box>
      )}

      {evidence && !loading && (
        <Stack spacing={3}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            <Section icon={Article} title={t("evidences.components.cards.session.title")}>
              <Stack spacing={2}>
                <Field label={t("evidences.components.cards.session.sessionField")} value={firstDefined(snapshot?.sessao_id, sessao?.sessao_id, sessaoId)} />
                <Field
                  label={t("evidences.components.cards.session.trainingField")}
                  value={firstDefined(
                    treinamento?.nome,
                    treinamento?.titulo,
                    treinamento?.descricao,
                    sessao?.treinamento_nome,
                    sessao?.treinamentoNome,
                    findDeepValue(snapshotPayload, [
                      'treinamento_nome',
                      'treinamentoNome',
                      'nome_treinamento',
                      'nomeTreinamento',
                    ])
                  )}
                />
                <Field label={t("evidences.components.cards.session.openingField")} value={formatDateTime(firstDefined(sessao?.data_abertura_apontamento, sessao?.dataAberturaApontamento))} />
                <Field label={t("evidences.components.cards.session.closingField")} value={formatDateTime(firstDefined(sessao?.data_fim, sessao?.fim, sessao?.dataFim))} />
              </Stack>
            </Section>

            <Section icon={Security} title={t("evidences.components.cards.context.title")}>
              <Stack spacing={2}>
                <Field label={t("evidences.components.cards.context.companyField")} value={firstDefined(empresa?.nome, empresa?.razao_social, sessao?.empresa_nome)} />
                <Field label={t("evidences.components.cards.context.unitField")} value={firstDefined(unidade?.nome, sessao?.unidade_nome)} />
                <Field label={t("evidences.components.cards.context.instructorField")} value={firstDefined(instrutor?.nome, instrutor?.nome_completo, sessao?.instrutor_nome)} />
                <Field label={t("evidences.components.cards.context.participantsField")} value={String(participantes.length)} />
              </Stack>
            </Section>

            <Section icon={FactCheck} title={t("evidences.components.cards.integrity.title")}>
              <Stack spacing={2}>
                <Field label={t("evidences.components.cards.integrity.snapshotField")} value={snapshotId} />
                <Field label={t("evidences.components.cards.integrity.schemaField")} value={snapshot?.schema_version} />
                <Field label={t("evidences.components.cards.integrity.algorithmField")} value={snapshot?.hash_algorithm || 'SHA256'} />
                <Field label={t("evidences.components.cards.integrity.createdAtField")} value={formatDateTime(snapshot?.criado_em)} />
              </Stack>
            </Section>

            <Section icon={History} title={t("evidences.components.cards.processing.title")}>
              <Stack spacing={2}>
                <Field label={t("evidences.components.cards.processing.jobField")} value={firstDefined(job?.status, job?.job_status, carimbo ? t("evidences.messages.labelProcessed") : null)} />
                <Field label={t("evidences.components.cards.processing.attemptsField")} value={firstDefined(job?.attempts, job?.tentativas, job?.tentativas_realizadas)} />
                <Field label={t("evidences.components.cards.processing.lastErrorField")} value={firstDefined(job?.last_erro, job?.last_error, job?.erro)} />
                <Field label={t("evidences.components.cards.processing.updatedAtField")} value={formatDateTime(firstDefined(job?.atualizado_em, job?.updated_at))} />
              </Stack>
            </Section>
          </Box>

          {participantRows.length > 0 && (
            <Section icon={FactCheck} title={t("evidences.components.cards.trainingParticipants.title")}>
              <TableContainer
                sx={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 2,
                  overflowX: 'auto',
                }}
              >
                <Table size="small" aria-label="Participantes do treinamento">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("evidences.components.cards.trainingParticipants.nameColumn")}</TableCell>
                      <TableCell>{t("evidences.components.cards.trainingParticipants.sectorColumn")}</TableCell>
                      <TableCell>{t("evidences.components.cards.trainingParticipants.levelColumn")}</TableCell>
                      <TableCell>{t("evidences.components.cards.trainingParticipants.methodColumn")}</TableCell>
                      <TableCell>{t("evidences.components.cards.trainingParticipants.registryColumn")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {participantRows.map((participante) => (
                      <TableRow key={participante.id}>
                        <TableCell>{participante.nome || '-'}</TableCell>
                        <TableCell>{participante.setor || '-'}</TableCell>
                        <TableCell>{participante.nivel || '-'}</TableCell>
                        <TableCell>{participante.metodo || participante.nfc || '-'}</TableCell>
                        <TableCell>{formatDateTime(participante.horario)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Section>
          )}

          <Section
            icon={Verified}
            title={t("evidences.components.cards.hashAndStamp.title")}
          >
            <Stack spacing={2.5}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                <Field label={t("evidences.components.cards.hashAndStamp.provider")} value={carimbo?.provider || 'BRY'} />
                <Field label={t("evidences.components.cards.hashAndStamp.environment")} value={carimbo?.ambiente} />
                <Field label={t("evidences.components.cards.hashAndStamp.nonce")} value={String(firstDefined(carimbo?.nonce, 1))} />
              </Box>

              <TextField
                label={t("evidences.components.cards.hashAndStamp.payloadHashTextField")}
                value={hash || ''}
                multiline
                minRows={1}
                fullWidth
                InputProps={{
                  readOnly: true,
                  sx: {
                    alignItems: 'flex-start',
                    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
                    fontSize: '0.86rem',
                    lineHeight: 1.55,
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={t("evidences.components.cards.hashAndStamp.payloadHashTextField")}>
                        <span>
                          <IconButton onClick={() => handleCopy(hash, 'Hash')} disabled={!hash}>
                            <ContentCopy />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label={t("evidences.components.cards.hashAndStamp.timestampTextField")}
                value={token || ''}
                multiline
                minRows={4}
                maxRows={8}
                fullWidth
                InputProps={{
                  readOnly: true,
                  sx: {
                    fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
                    fontSize: '0.82rem',
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title={t("evidences.components.cards.hashAndStamp.timestampTextField")}>
                        <span>
                          <IconButton onClick={() => handleCopy(token, 'Token')} disabled={!token}>
                            <ContentCopy />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  variant="outlined"
                  startIcon={actionLoading === 'bry' ? <CircularProgress size={18} /> : <Verified />}
                  onClick={handleValidateBry}
                  disabled={!carimboId || Boolean(actionLoading)}
                >
                  {t("evidences.components.cards.hashAndStamp.validationButton")}
                </Button>
                <Button
                  variant="contained"
                  startIcon={actionLoading === 'download' ? <CircularProgress color="inherit" size={18} /> : <Download />}
                  onClick={handleDownloadTst}
                  disabled={!carimboId || Boolean(actionLoading)}
                >
                  {t("evidences.components.cards.hashAndStamp.downloadTstButton")}
                </Button>
              </Stack>

              {bryValidation && (
                <Stack spacing={2}>
                  <Alert severity="success">
                    {t("evidences.components.cards.validate.concludedMessage")}
                  </Alert>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        height: { xs: 340, md: 420 },
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        border: '1px solid rgba(255,255,255,0.08)',
                        bgcolor: 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                        {t("evidences.components.cards.validate.sendedCard.title")}
                      </Typography>
                      <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
                        <Stack spacing={1.5}>
                          {bryRequestSummary.map((item) => (
                            <Field
                              key={item.label}
                              label={item.label}
                              value={formatYesNo(item.value, t)}
                              mono={item.mono}
                            />
                          ))}
                        </Stack>
                      </Box>
                    </Paper>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        height: { xs: 340, md: 420 },
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        border: '1px solid rgba(255,255,255,0.08)',
                        bgcolor: 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                        {t("evidences.components.cards.validate.resultCard.title")}
                      </Typography>
                      <Box sx={{ flex: 1, overflow: 'auto', pr: 1 }}>
                        {bryResponseSummary.length > 0 ? (
                          <Stack spacing={1.5}>
                            {bryResponseSummary.map((item) => (
                              <Field
                                key={item.label}
                                label={item.label}
                                value={formatYesNo(item.value, t)}
                                mono={item.mono}
                              />
                            ))}
                          </Stack>
                        ) : (
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {t("evidences.components.cards.validate.bryNotReturnMessage")}
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  </Box>
                </Stack>
              )}
            </Stack>
          </Section>

          <Section icon={Article} title={t("evidences.components.cards.validate.evidencePayload.title")}>
            <Stack spacing={2}>
              <TextField
                select
                size="small"
                label={t("evidences.components.cards.validate.evidencePayload.sectionField")}
                value={selectedPayloadSection?.value || 'completo'}
                onChange={(event) => setPayloadSection(event.target.value)}
                sx={{ width: { xs: '100%', sm: 260 } }}
              >
                {payloadSections.map((section) => (
                  <MenuItem key={section.value} value={section.value}>
                    {section.label}
                  </MenuItem>
                ))}
              </TextField>
              <JsonViewer value={selectedPayloadSection?.data || snapshotPayload} minRows={10} />
            </Stack>
          </Section>
        </Stack>
      )}

      <Snackbar
        open={feedback.open}
        autoHideDuration={3500}
        onClose={() => setFeedback((current) => ({ ...current, open: false }))}
      >
        <Alert
          onClose={() => setFeedback((current) => ({ ...current, open: false }))}
          severity={feedback.severity}
          sx={{ width: '100%' }}
        >
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AuditoriaEvidencias;
