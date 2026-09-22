# Graph Report - mmt-broker-basic-ui  (2026-09-21)

## Corpus Check
- 436 files · ~180,549 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3126 nodes · 11726 edges · 146 communities (130 shown, 16 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.59)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `66817b06`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- contest/api.ts
- skeleton.tsx
- ib-program-payment-rule-form-dialog.tsx
- insurance/index.ts
- cn
- errors.ts
- api-error-alert.tsx
- alert-dialog.tsx
- scheduling/api.ts
- ib-plan-subscription/index.ts
- ib-payment-template-level-form-dialog.tsx
- formatBrokerApiError
- client-contest-subscribe-dialog.tsx
- client-risk-metrics/api.ts
- trading-server/api.ts
- bonus-assignment-logs-view.tsx
- platform/api.ts
- ib-volume-reward-trades-report-view.tsx
- client-ib-progression-panel.tsx
- form-builder-view.tsx
- positions/api.ts
- public-risk-metrics-view.tsx
- client-risk-metrics/types.ts
- form-document.ts
- broker-client.ts
- ib-analytics/api.ts
- contest-workspace-panels.tsx
- bonus-offer/api.ts
- trading-server/format.ts
- ib-plan-programs-sync-view.tsx
- risk-control/api.ts
- client-bonus-assignment-detail-dialog.tsx
- dashboard-breadcrumbs.tsx
- trading-account/api.ts
- bonus-offer-delete-dialog.tsx
- client-analytics-behavior-panel.tsx
- ib-volume-reward-trades/types.ts
- card.tsx
- bonus-offer-form-dialog.tsx
- client-analytics-profitability-panel.tsx
- IbProgramSymbolsView
- ib-reward-logs/index.ts
- compilerOptions
- client-insurance/api.ts
- client-risk-metrics-view.tsx
- ib-plan/api.ts
- BonusOfferTemplatesView
- site-header.tsx
- bonus-offer-template-form-dialog.tsx
- readSession
- bonus-offers-view.tsx
- client-trading-account/api.ts
- auth.ts
- position-history-view.tsx
- configuration/api.ts
- client-analytics-dashboard-panel.tsx
- components.json
- bonus-assignment-detail-dialog.tsx
- use-account-positions-channel.ts
- session.server.ts
- ib-program/api.ts
- ib-reward/index.ts
- TradingAccountsView
- getTradingServerForAdmin
- server-group-edit-sheet.tsx
- devDependencies
- dependencies
- client-analytics-symbol-panel.tsx
- symbol-category/api.ts
- client-bonus/api.ts
- ClientPositionsPanel
- client-analytics-risk-drawdown-panel.tsx
- IbPlanSubscriptionsView
- BonusAssignmentLogsView
- use-trading-stream-positions-channel.ts
- ContestSubscriptionsView
- leverage-form-dialog.tsx
- BonusExcludedInstrumentsView
- tooltip.tsx
- client-positions/api.ts
- ClientTradingAccountsView
- listIbPlanPrograms
- ib-progression-template/api.ts
- apply-position-snapshot.ts
- initial-amount/api.ts
- contest-general-form.tsx
- trading-account-actions-menu.tsx
- parse-broker-error.ts
- ContestBansDialog
- InitialAmountServerGroupsDialog
- TradingServerGroupsView
- LeveragesView
- ib-subscription-form-dialog.tsx
- config-form.ts
- session-constants.ts
- broker/[...path]/route.ts
- SiteHeader
- ContestConditionsView
- IbPlansView
- ib-program-payment-rules-view.tsx
- bonus-offer-admin-assign-dialog.tsx
- risk-metrics-share-dialog.tsx
- InitialAmountsView
- package.json
- IbProgramsView
- login-form.tsx
- area-switcher.tsx
- client-insurances-view.tsx
- IbPaymentTemplatesView
- listServerGroupsForAdmin
- client-analytics-temporal-panel.tsx
- PositionsReportView
- listServerGroupLeverages
- FormsListView
- TradingAccountResetCredentialsDialog
- scripts
- bonus-assignment-logs/api.ts
- bonus-offer-server-groups-dialog.tsx
- README.md
- TradingSymbolsView
- PositionHistoryView
- browserBrokerRequest
- subscriptionStatusLabel
- RejectionTemplatesView
- browser-client.ts
- account-insurance-claim-dialogs.tsx
- IbPaymentTemplateFormDialog
- jwf-submission-readonly.tsx
- trading-account-access-dialog.tsx
- initial-amount-delete-dialog.tsx
- handleSubmit
- useIsMobile
- contest-global-settings-view.tsx
- trading-account-positions-dialog.tsx
- client-positions-panel.tsx
- OpenPositionDialog
- IbProgramFormDialog
- eslint.config.mjs
- lucide-react
- laravel-echo
- next.config.ts
- pusher-js
- react
- react-dom
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `formatBrokerApiError()` - 368 edges
2. `browserBrokerRequest()` - 264 edges
3. `cn()` - 226 edges
4. `ApiErrorAlert()` - 145 edges
5. `Button()` - 133 edges
6. `Skeleton()` - 94 edges
7. `Label()` - 87 edges
8. `Input()` - 81 edges
9. `DialogContent()` - 65 edges
10. `DialogHeader()` - 65 edges

## Surprising Connections (you probably didn't know these)
- `handle()` --calls--> `proxyBrokerRequest()`  [EXTRACTED]
  app/api/broker/[...path]/route.ts → lib/api/broker-client.ts
- `BreadcrumbEllipsis()` --calls--> `cn()`  [EXTRACTED]
  components/ui/breadcrumb.tsx → lib/utils.ts
- `DropdownMenuLabel()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts
- `handleSubscribe()` --calls--> `formatBrokerApiError()`  [EXTRACTED]
  features/client-ib/components/client-ib-plan-card.tsx → lib/api/errors.ts
- `getPublicRiskMetricsHistory()` --calls--> `browserBrokerRequest()`  [EXTRACTED]
  features/client-risk-metrics/api.ts → lib/api/browser-client.ts

## Import Cycles
- None detected.

## Communities (146 total, 16 thin omitted)

### Community 0 - "contest/api.ts"
Cohesion: 0.07
Nodes (58): buildServerGroupLabel(), createContestAward(), createContestCondition(), deleteContest(), deleteContestAward(), deleteContestCondition(), getContestGlobalSettings(), invalidateContestFormCatalog() (+50 more)

### Community 1 - "skeleton.tsx"
Cohesion: 0.08
Nodes (88): ActionTooltipButton(), ActionTooltipButtonProps, PageContentToolbar(), PageContentToolbarProps, Badge(), badgeVariants, Input(), SelectContent() (+80 more)

### Community 2 - "ib-program-payment-rule-form-dialog.tsx"
Cohesion: 0.17
Nodes (24): createIbProgramCpaRule(), createIbProgramPnlRule(), createIbProgramVolumeRule(), ibProgramPath(), updateIbProgramCpaRule(), updateIbProgramPnlRule(), updateIbProgramVolumeRule(), emptyForm (+16 more)

### Community 3 - "insurance/index.ts"
Cohesion: 0.05
Nodes (58): approveAccountInsuranceClaim(), compactFilters(), createInsurancePlan(), createInsurancePlanOption(), deleteInsurancePlan(), deleteInsurancePlanOption(), getInsurancePlan(), listAccountInsurancesAdmin() (+50 more)

### Community 4 - "cn"
Cohesion: 0.06
Nodes (58): AppSidebar(), bonusNavigation, contestsNavigation, ibNavigation, insuranceNavigation, reportsNavigation, systemNavigation, tradingNavigation (+50 more)

### Community 5 - "errors.ts"
Cohesion: 0.07
Nodes (84): ApiErrorAlert(), Button(), buttonVariants, Checkbox(), Dialog(), DialogContent(), DialogDescription(), DialogFooter() (+76 more)

### Community 6 - "api-error-alert.tsx"
Cohesion: 0.09
Nodes (41): ApiErrorAlertProps, buildPageItems(), PAGE_SIZE_OPTIONS, PageNumberPagination(), PageNumberPaginationProps, subscribeToHydration(), Alert(), AlertDescription() (+33 more)

### Community 7 - "alert-dialog.tsx"
Cohesion: 0.16
Nodes (28): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogTitle() (+20 more)

### Community 8 - "scheduling/api.ts"
Cohesion: 0.07
Nodes (40): hasActiveScheduledCommandRun(), buildListSearchParams(), cancelScheduledCommandRun(), getScheduledCommand(), listScheduledCommands(), runScheduledCommand(), updateScheduledCommand(), formatDateTime() (+32 more)

### Community 9 - "ib-plan-subscription/index.ts"
Cohesion: 0.14
Nodes (30): adminSubscriptionsPath(), createIbPlanSubscription(), getIbPlanSubscriptionFormSubmission(), listIbPlanSubscriptionAdminInteractions(), listIbPlanSubscriptions(), toSearchParams(), updateIbPlanSubscription(), updateIbPlanSubscriptionParameters() (+22 more)

### Community 10 - "ib-payment-template-level-form-dialog.tsx"
Cohesion: 0.17
Nodes (22): createIbPaymentTemplate(), createIbPaymentTemplateLevel(), deleteIbPaymentTemplate(), deleteIbPaymentTemplateLevel(), listIbPaymentTemplates(), updateIbPaymentTemplateLevel(), IbPaymentTemplateLevelDeleteDialog(), handleDelete() (+14 more)

### Community 11 - "formatBrokerApiError"
Cohesion: 0.05
Nodes (43): BonusOfferTemplateDeleteDialog(), handleDelete(), ContestAwardDeleteDialog(), handleDelete(), ContestConditionDeleteDialog(), handleDelete(), ContestDeleteDialog(), handleDelete() (+35 more)

### Community 12 - "client-contest-subscribe-dialog.tsx"
Cohesion: 0.13
Nodes (24): ClientContestsPage(), getContestBannerUrl(), getContestRegistrationOptions(), getPublicContestGlobalSettings(), listEligibleAccountsForContest(), subscribeToContest(), ClientContestHelpCard(), load() (+16 more)

### Community 13 - "client-risk-metrics/api.ts"
Cohesion: 0.11
Nodes (31): analyticsOverviewInflight, analyticsOverviewRequestKey(), getAccountAnalyticsBehavior(), getAccountAnalyticsDaily(), getAccountAnalyticsDrawdowns(), getAccountAnalyticsDurationScatter(), getAccountAnalyticsEquityCurve(), getAccountAnalyticsOverview() (+23 more)

### Community 14 - "trading-server/api.ts"
Cohesion: 0.13
Nodes (33): cachedEnvironmentsByAudience, configSchemasByPlatform, configSchemasDeniedPlatforms, createTradingServer(), deleteTradingServer(), listTradingServerConfigSchemas(), syncTradingServer(), SyncTradingServerOptions (+25 more)

### Community 15 - "bonus-assignment-logs-view.tsx"
Cohesion: 0.14
Nodes (29): abbreviateUuid(), breadcrumbs, ColumnSortHeadProps, DepositIntentsTable(), logsTabs, depositBonusIntentStatusLabel(), depositBonusIntentStatusVariant(), BONUS_ASSIGNMENT_STATUSES (+21 more)

### Community 16 - "platform/api.ts"
Cohesion: 0.18
Nodes (19): appendPlatformFormData(), createPlatform(), deletePlatform(), getPlatform(), listAvailablePlatforms(), listConfiguredPlatforms(), listPlatforms(), mapPlatformResponse() (+11 more)

### Community 17 - "ib-volume-reward-trades-report-view.tsx"
Cohesion: 0.11
Nodes (35): paymentStatusLabel(), paymentStatusVariant(), getIbVolumeRewardTradeRewards(), DEFAULT_FILTERS, EMPTY_DRAFT, FilterDraft, identity(), paymentTemplateLabel() (+27 more)

### Community 18 - "client-ib-progression-panel.tsx"
Cohesion: 0.14
Nodes (24): compactFilters(), getActiveIbPlanContext(), getMyIbPlanSubscription(), listClientIbPlans(), listMyIbPlanProgressionLogs(), subscribeToIbPlan(), withProxyClientPlan(), withProxyProgramImage() (+16 more)

### Community 19 - "form-builder-view.tsx"
Cohesion: 0.09
Nodes (37): archiveFormVersion(), cloneFormVersion(), createForm(), deleteForm(), getForm(), getFormVersion(), listForms(), publishFormVersion() (+29 more)

### Community 20 - "positions/api.ts"
Cohesion: 0.13
Nodes (15): buildPositionsReportSearchParams(), exportPositionsReport(), getPositionReportDetail(), listPositionsReport(), download(), PositionReportDetail, PositionReportFilters, PositionReportIdentity (+7 more)

### Community 21 - "public-risk-metrics-view.tsx"
Cohesion: 0.07
Nodes (32): PublicRiskMetricsPageProps, getPublicRiskMetricsSummary(), applyLiveEquityChange(), applyRiskMetricChanges(), parseMetricJsonValue(), toUnixSecond(), toUtcDateKey(), PublicAnalyticsOverviewView() (+24 more)

### Community 22 - "client-risk-metrics/types.ts"
Cohesion: 0.05
Nodes (38): AnalyticsCumulativePnl, AnalyticsDailyDayBehavior, AnalyticsDailyStats, AnalyticsDailyStreakSegment, AnalyticsDailyTradeRow, AnalyticsDailyTransitionMatrix, AnalyticsDurationScatterPoint, AnalyticsEquityCurvePoint (+30 more)

### Community 23 - "form-document.ts"
Cohesion: 0.11
Nodes (33): FormBuilderPageProps, elementTitle(), FormBuilderView(), addElement(), changeDocument(), dropIntoContainer(), removeElement(), save() (+25 more)

### Community 24 - "broker-client.ts"
Cohesion: 0.13
Nodes (23): buildIamUpstreamUrl(), DELETE, GET, handle(), PATCH, POST, PUT, RouteContext (+15 more)

### Community 25 - "ib-analytics/api.ts"
Cohesion: 0.13
Nodes (16): getIbAnalyticsMonthly(), getIbAnalyticsSummary(), getIbAnalyticsYtd(), listIbAnalyticsRewards(), path(), toSearchParams(), IbAnalyticsView(), IbAnalyticsAudience (+8 more)

### Community 26 - "contest-workspace-panels.tsx"
Cohesion: 0.08
Nodes (41): tabs, ClientContestsView(), assignContestAward(), assignContestCondition(), getContest(), listAssignedContestAwards(), listAssignedContestConditions(), listContestAwards() (+33 more)

### Community 27 - "bonus-offer/api.ts"
Cohesion: 0.13
Nodes (34): adminAssignBonus(), deleteBonusOffer(), invalidateBonusOfferFormCatalog(), listBonusOfferTemplates(), listEligibleAccountsForBonusOfferAdmin(), loadBonusOfferFormCatalog(), syncBonusExcludedInstruments(), syncBonusOfferServerGroups() (+26 more)

### Community 28 - "trading-server/format.ts"
Cohesion: 0.10
Nodes (28): ClientTradingAccountCreateDialog(), emptyCountryRow(), ServerGroupEditSheet(), handleSubmit(), handleSubmit(), successMessage(), toRequestBody(), TradingSymbolsTable() (+20 more)

### Community 29 - "ib-plan-programs-sync-view.tsx"
Cohesion: 0.11
Nodes (31): IbPlanProgramsPageProps, IbPlanProgramPivotFormDialog(), handleSubmit(), AvailableProgramItem(), handleDragStart(), formatProgressionMaxVolume(), IbPlanProgramsSyncView(), handleAssignedDrop() (+23 more)

### Community 30 - "risk-control/api.ts"
Cohesion: 0.11
Nodes (22): Props, Props, archiveRiskControlRule(), listRiskControlExecutions(), listRiskControlRules(), loadRiskControlCatalog(), prefix(), formatDate() (+14 more)

### Community 31 - "client-bonus-assignment-detail-dialog.tsx"
Cohesion: 0.15
Nodes (23): getClientBonusAssignment(), ClientBonusAssignmentDetailDialog(), loadAssignment(), ClientBonusAssignmentDetailDialogProps, ClientBonusClaimDialog(), ClientBonusesView(), assignmentOfferName(), assignmentOfferType() (+15 more)

### Community 32 - "dashboard-breadcrumbs.tsx"
Cohesion: 0.27
Nodes (9): DashboardBreadcrumbs(), DashboardBreadcrumbsProps, Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage() (+1 more)

### Community 33 - "trading-account/api.ts"
Cohesion: 0.17
Nodes (19): ListTradingAccountPositionsParams, listTradingAccounts(), resetTradingAccountCredentials(), ResetTradingAccountCredentialsInput, toSearchParams(), TradingAccountListMeta, TradingAccountListResponse, updateTradingAccount() (+11 more)

### Community 34 - "bonus-offer-delete-dialog.tsx"
Cohesion: 0.16
Nodes (23): BonusOfferDeleteDialogProps, ContestSubscriptionBanDialogProps, compactFilters(), createRejectionTemplate(), deleteRejectionTemplate(), getRejectionTemplate(), listRejectionTemplates(), updateRejectionTemplate() (+15 more)

### Community 35 - "client-analytics-behavior-panel.tsx"
Cohesion: 0.10
Nodes (24): getAccountAnalyticsDailyDayTrades(), buildCalendarGrid(), CalendarMonthView(), CalendarViewMode, CalendarYearView(), ClientAnalyticsBehaviorPanel(), ClientAnalyticsBehaviorPanelProps, dailyKey() (+16 more)

### Community 36 - "ib-volume-reward-trades/types.ts"
Cohesion: 0.08
Nodes (24): buildReportSearchParams(), exportIbVolumeRewardTrades(), listIbVolumeRewardTrades(), IbVolumeRewardTradesReportView(), applyFilters(), download(), timestamp(), CalculationAvailability (+16 more)

### Community 37 - "card.tsx"
Cohesion: 0.16
Nodes (17): BrokerRequestCredentials(), BrokerRequestCredentialsProps, CredentialValue(), Card(), CardContent(), CardDescription(), CardFooter(), CardHeader() (+9 more)

### Community 38 - "bonus-offer-form-dialog.tsx"
Cohesion: 0.11
Nodes (26): createBonusOffer(), getBonusOffer(), listEligibleIntroducingBrokers(), syncBonusOfferIntroducingBrokers(), updateBonusOffer(), BonusOfferFormDialog(), handleSubmit(), loadEligibleIbs() (+18 more)

### Community 39 - "client-analytics-profitability-panel.tsx"
Cohesion: 0.11
Nodes (19): AnalyticsPanelCard(), BreakEvenGauge(), ClientAnalyticsProfitabilityPanel(), ClientAnalyticsProfitabilityPanelProps, CumulativeGranularity, DirectionBreakdown(), ExpectancyContributionBar(), formatCurrency() (+11 more)

### Community 40 - "IbProgramSymbolsView"
Cohesion: 0.12
Nodes (21): ibProgramPath(), listAllIbProgramSymbols(), listIbProgramSymbols(), syncIbProgramSymbols(), IbProgramSymbolConfigSheet(), IbProgramSymbolsView(), handleAddSymbol(), handleSave() (+13 more)

### Community 41 - "ib-reward-logs/index.ts"
Cohesion: 0.14
Nodes (17): compactFilters(), listIbRewardSettlementRuns(), listIbTradingAccountPeriodSnapshots(), IbRewardLogsView(), isRewardLogTab(), truncateId(), formatDateTimeValue(), formatMoneyValue() (+9 more)

### Community 42 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 43 - "client-insurance/api.ts"
Cohesion: 0.10
Nodes (25): cancelClientAccountInsurance(), claimClientAccountInsurance(), compactFilters(), contractClientAccountInsurance(), isInsuranceCandidateAccount(), listClientAccountInsurances(), listInsurancePlansForAccount(), loadAccountsWithInProgressInsurance() (+17 more)

### Community 44 - "client-risk-metrics-view.tsx"
Cohesion: 0.09
Nodes (22): AccountMetricsPageProps, ANALYTICS_TABS, AnalyticsTab, applyAnalyticsUpdate(), applyDashboardMetrics(), applyPhaseMetricsUpdate(), ClientRiskMetricsView(), ClientRiskMetricsViewProps (+14 more)

### Community 45 - "ib-plan/api.ts"
Cohesion: 0.18
Nodes (23): appendIbPlanFormData(), createIbPlan(), deleteIbPlan(), listIbPlans(), mapIbPlanResponse(), mapIbPlansResponse(), seedIbDemoCatalog(), updateIbPlan() (+15 more)

### Community 46 - "BonusOfferTemplatesView"
Cohesion: 0.18
Nodes (10): BonusOfferTemplatesView(), clearFilters(), commitFilters(), handleMutationSuccess(), onFilterEnter(), patchDraft(), toggleSort(), formToAppliedFilters() (+2 more)

### Community 47 - "site-header.tsx"
Cohesion: 0.06
Nodes (9): TradingServersPageProps, TradingSecuritiesPageProps, TradingServerSecuritySymbolsPageProps, TradingServerGroupsPageProps, TradingServerGroupSecuritiesPageProps, SiteHeaderProps, Separator(), ContestGlobalSettingsView() (+1 more)

### Community 48 - "bonus-offer-template-form-dialog.tsx"
Cohesion: 0.15
Nodes (27): createBonusOfferTemplate(), deleteBonusOfferTemplate(), getBonusOfferTemplate(), listBonusOfferTemplates(), syncBonusOfferTemplateExcludedInstruments(), toSearchParams(), updateBonusOfferTemplate(), BonusOfferTemplateFormDialog() (+19 more)

### Community 49 - "readSession"
Cohesion: 0.21
Nodes (15): AdminLoginPage(), AdminLoginPageProps, ClientLoginPage(), ClientLoginPageProps, ClientHomePage(), DashboardPage(), loginHref(), resolveAuthArea() (+7 more)

### Community 50 - "bonus-offers-view.tsx"
Cohesion: 0.09
Nodes (20): bonusOfferExcludedInstrumentsPath(), bonusOfferTemplateExcludedInstrumentsPath(), listBonusOffers(), toSearchParams(), BonusOfferDeleteDialog(), handleDelete(), bonusOffersBreadcrumbs, BonusOffersView() (+12 more)

### Community 51 - "client-trading-account/api.ts"
Cohesion: 0.12
Nodes (22): createClientTradingAccount(), listClientServerGroupsForSelection(), loadClientAccountCatalog(), startTradingCredentialsChallenge(), toClientServerGroup(), updateClientTradingAccountCredentials(), handleSubmit(), loadServerGroups() (+14 more)

### Community 52 - "auth.ts"
Cohesion: 0.23
Nodes (18): iamForwardHeaders(), LOGIN_PATH, loginAction(), logoutAction(), parseArea(), iamApiBase(), iamLogin(), iamLogout() (+10 more)

### Community 53 - "position-history-view.tsx"
Cohesion: 0.24
Nodes (11): listPositionCommissionRewards(), formatAmount(), PositionCommissionRewardsDialog(), loadRewards(), PositionCommissionRewardsDialogProps, DEFAULTS, FILTER_KEYS, PositionsTab (+3 more)

### Community 54 - "configuration/api.ts"
Cohesion: 0.15
Nodes (15): listConfigs(), updateConfigsBatch(), ConfigurationView(), handleSave(), CATEGORY_LABELS, categoryLabel(), displayValueForForm(), groupConfigsByCategory() (+7 more)

### Community 55 - "client-analytics-dashboard-panel.tsx"
Cohesion: 0.14
Nodes (21): AnalyticsDashboardSnapshot, ChartToggleChip(), ClientAnalyticsDashboardPanel(), ClientAnalyticsDashboardPanelProps, formatCurrency(), formatMetric(), formatNumber(), formatPercent() (+13 more)

### Community 56 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 57 - "bonus-assignment-detail-dialog.tsx"
Cohesion: 0.32
Nodes (14): getBonusAssignment(), BonusAssignmentDetailDialog(), loadAssignment(), BonusAssignmentDetailDialogProps, AssignmentsTable(), bonusAssignmentOfferLabel(), bonusAssignmentStatusLabel(), bonusAssignmentStatusVariant() (+6 more)

### Community 58 - "use-account-positions-channel.ts"
Cohesion: 0.16
Nodes (16): accountWatchPath(), heartbeatOpenPositionsWatch(), unwatchOpenPositions(), watchOpenPositions(), PositionsLiveStatus, useAccountPositionsChannel(), UseAccountPositionsChannelOptions, accountPositionsPrivateChannel() (+8 more)

### Community 59 - "session.server.ts"
Cohesion: 0.22
Nodes (15): decodeJwtPayload(), displayNameFromClaims(), jwtPayloadSegment(), sessionCookieName(), decryptSession(), encryptSession(), sessionCookieMaxMs(), accessTokenStale() (+7 more)

### Community 60 - "ib-program/api.ts"
Cohesion: 0.21
Nodes (17): withProxyProgramImage(), appendIbProgramFormData(), createIbProgram(), deleteIbProgram(), listIbPrograms(), mapIbProgramResponse(), mapIbProgramsResponse(), updateIbProgram() (+9 more)

### Community 61 - "ib-reward/index.ts"
Cohesion: 0.15
Nodes (16): money(), compactFilters(), listIbRewards(), IbRewardsView(), RewardParticipantCell(), truncateId(), formatDateTimeValue(), formatMoneyValue() (+8 more)

### Community 62 - "TradingAccountsView"
Cohesion: 0.12
Nodes (15): abbreviateUuid(), formatMoney(), formToAppliedFilters(), parseOptionalNumber(), pnlClassName(), TradingAccountsView(), applyFiltersFromDraft(), changePage() (+7 more)

### Community 63 - "getTradingServerForAdmin"
Cohesion: 0.08
Nodes (15): loadLeverages(), getTradingServerForAdmin(), listCatalogServerGroupLeverages(), listCatalogServerGroups(), listSecurities(), listSecuritySymbols(), listServerGroupSecurities(), toSearchParams() (+7 more)

### Community 64 - "server-group-edit-sheet.tsx"
Cohesion: 0.16
Nodes (17): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetTitle(), FormElementEditorSheet(), addOption() (+9 more)

### Community 65 - "devDependencies"
Cohesion: 0.11
Nodes (19): babel-plugin-react-compiler, eslint, eslint-config-next, devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, tailwindcss (+11 more)

### Community 66 - "dependencies"
Cohesion: 0.11
Nodes (19): @base-ui/react, class-variance-authority, clsx, lightweight-charts, next, dependencies, @base-ui/react, class-variance-authority (+11 more)

### Community 67 - "client-analytics-symbol-panel.tsx"
Cohesion: 0.18
Nodes (17): getAccountAnalyticsSymbols(), ClientAnalyticsSymbolPanel(), load(), ClientAnalyticsSymbolPanelProps, formatNumber(), formatPercent(), formatSideLabel(), formatSymbolMetric() (+9 more)

### Community 68 - "symbol-category/api.ts"
Cohesion: 0.19
Nodes (12): compactFilters(), createSymbolCategory(), deleteSymbolCategory(), listAllSymbolCategories(), listSymbolCategories(), updateSymbolCategory(), SymbolCategoriesView(), handleSubmit() (+4 more)

### Community 69 - "client-bonus/api.ts"
Cohesion: 0.15
Nodes (15): BonusAssignment, claimBonusOffer(), compactFilters(), listAvailableBonusOffers(), listClientBonusAssignments(), listEligibleAccountsForBonusOffer(), handleSubmit(), loadAccounts() (+7 more)

### Community 70 - "ClientPositionsPanel"
Cohesion: 0.26
Nodes (8): ClientPositionsPanel(), formatNumber(), formatOpenedAt(), formatSide(), HistoryPositionsTable(), LivePositionsTable(), listTradingAccountPositions(), TradingAccountPositionsDialog()

### Community 71 - "client-analytics-risk-drawdown-panel.tsx"
Cohesion: 0.20
Nodes (14): ClientAnalyticsRiskDrawdownPanel(), ClientAnalyticsRiskDrawdownPanelProps, formatCurrency(), formatDays(), formatNumber(), formatPercent(), formatSignedCurrency(), MetricRow() (+6 more)

### Community 72 - "IbPlanSubscriptionsView"
Cohesion: 0.14
Nodes (9): abbreviateUuid(), formToAppliedFilters(), IbPlanSubscriptionsView(), applyFiltersFromDraft(), clearFilters(), commitFilters(), onFilterEnter(), parseOptionalNumber() (+1 more)

### Community 73 - "BonusAssignmentLogsView"
Cohesion: 0.16
Nodes (13): assignmentFormToFilters(), BonusAssignmentLogsView(), clearFilters(), commitAssignmentFilters(), commitIntentFilters(), onAssignmentFilterEnter(), onIntentFilterEnter(), patchAssignmentDraft() (+5 more)

### Community 74 - "use-trading-stream-positions-channel.ts"
Cohesion: 0.17
Nodes (15): GatewayPosition, GatewayPositionsEvent, GatewaySubscriptionRejected, GatewayWelcomeFrame, isPositionsEvent(), isRecord(), isSubscriptionRejected(), isWelcomeFrame() (+7 more)

### Community 75 - "ContestSubscriptionsView"
Cohesion: 0.13
Nodes (18): listContestConditions(), listContestParticipants(), listContests(), storeContestBan(), toSearchParams(), ContestSubscriptionBanDialog(), handleBan(), abbreviateUuid() (+10 more)

### Community 76 - "leverage-form-dialog.tsx"
Cohesion: 0.21
Nodes (16): compactFilters(), createLeverage(), deleteLeverage(), getLeverage(), LeverageAudience, listLeverages(), updateLeverage(), emptyForm (+8 more)

### Community 77 - "BonusExcludedInstrumentsView"
Cohesion: 0.27
Nodes (9): BonusExcludedInstrumentsView(), handleAddSymbol(), handleSave(), ExcludedInstrumentDraft, draftsSignature(), draftToSyncInput(), excludedInstrumentFromApi(), excludedInstrumentFromTradingSymbol() (+1 more)

### Community 78 - "tooltip.tsx"
Cohesion: 0.19
Nodes (10): geistMono, geistSans, metadata, Tooltip(), TooltipContent(), TooltipProvider(), TooltipTrigger(), BONUS_OFFER_FIELD_HELP (+2 more)

### Community 79 - "client-positions/api.ts"
Cohesion: 0.23
Nodes (12): accountHistoryPath(), accountPositionsPath(), closePosition(), listAccountPositions(), openPosition(), handleClose(), AccountPosition, ClosePositionInput (+4 more)

### Community 80 - "ClientTradingAccountsView"
Cohesion: 0.13
Nodes (8): ClientTradingAccountsView(), enrichAccounts(), formatLeverageLabel(), formatAccountMoney(), formatEnvironmentLabel(), moneyFormatter, parseServerGroupDefaultAmount(), serverGroupNeedsInitialAmount()

### Community 81 - "listIbPlanPrograms"
Cohesion: 0.33
Nodes (6): listIbPlanPrograms(), syncIbPlanPrograms(), withProxyPlanProgramAssignment(), IbPlanSubscriptionFormDialog(), handleSubmit(), loadPrograms()

### Community 82 - "ib-progression-template/api.ts"
Cohesion: 0.15
Nodes (14): createIbProgressionTemplate(), deleteIbProgressionTemplate(), listIbProgressionTemplates(), updateIbProgressionTemplate(), IbProgressionTemplatesView(), handleDelete(), TemplateForm(), handleSubmit() (+6 more)

### Community 83 - "apply-position-snapshot.ts"
Cohesion: 0.43
Nodes (6): applyOpenPositionsSnapshot(), normalizeLivePosition(), toSide(), toSortableTime(), OpenPositionsSnapshotPayload, PositionSide

### Community 84 - "initial-amount/api.ts"
Cohesion: 0.27
Nodes (9): compactFilters(), getInitialAmount(), listInitialAmounts(), CreateInitialAmountInput, InitialAmount, InitialAmountListFilters, InitialAmountServerGroup, SyncInitialAmountServerGroupsInput (+1 more)

### Community 85 - "contest-general-form.tsx"
Cohesion: 0.17
Nodes (18): createContest(), updateContest(), amountStep(), ContestGeneralForm(), handleSubmit(), ContestGeneralFormProps, contestToForm(), emptyForm (+10 more)

### Community 86 - "trading-account-actions-menu.tsx"
Cohesion: 0.27
Nodes (9): DropdownMenu(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuSeparator(), DropdownMenuTrigger(), TradingAccountAccessAction, TradingAccountActionsMenu() (+1 more)

### Community 87 - "parse-broker-error.ts"
Cohesion: 0.60
Nodes (5): extractValidationMessages(), humanizeValidationMessage(), isRecord(), parseBrokerErrorPayload(), ParsedBrokerError

### Community 88 - "ContestBansDialog"
Cohesion: 0.26
Nodes (12): revertContestBan(), abbreviateUuid(), ContestBansDialog(), applyFiltersFromDraft(), clearFilters(), commitFilters(), handleRevert(), onFilterEnter() (+4 more)

### Community 89 - "InitialAmountServerGroupsDialog"
Cohesion: 0.50
Nodes (3): syncInitialAmountServerGroups(), InitialAmountServerGroupsDialog(), handleSubmit()

### Community 90 - "TradingServerGroupsView"
Cohesion: 0.20
Nodes (4): formToAppliedFilters(), TradingServerGroupsView(), applyFilters(), formatBookTypeLabel()

### Community 92 - "ib-subscription-form-dialog.tsx"
Cohesion: 0.29
Nodes (8): getIbPlanSubscriptionForm(), fieldErrors(), findForm(), IbSubscriptionFormDialog(), handleSubmit(), inputNodes(), Props, IbSubscriptionFormRuntime

### Community 93 - "config-form.ts"
Cohesion: 0.36
Nodes (8): TradingServerFormDialog(), handleSubmit(), loadOptions(), buildEmptyConfig(), configFromTradingServer(), getDefaultSchemaId(), MASKED_SECRET_VALUE, serializeConfigForSubmit()

### Community 94 - "session-constants.ts"
Cohesion: 0.29
Nodes (8): ADMIN_2FA_COOKIE, ADMIN_SESSION_COOKIE, CLIENT_2FA_COOKIE, CLIENT_SESSION_COOKIE, parseSessionPayload(), config, hasValidSession(), middleware()

### Community 95 - "broker/[...path]/route.ts"
Cohesion: 0.25
Nodes (7): DELETE, GET, handle(), PATCH, POST, PUT, RouteContext

### Community 96 - "SiteHeader"
Cohesion: 0.08
Nodes (5): IbPlanSubscriptionsPageProps, SiteHeader(), ContestAwardsView(), ContestCreateView(), PlatformsView()

### Community 99 - "ib-program-payment-rules-view.tsx"
Cohesion: 0.16
Nodes (11): listIbProgramCpaRules(), listIbProgramPnlRules(), listIbProgramVolumeRules(), ibProgramPaymentRulesBreadcrumbs, IbProgramPaymentRulesView(), renderRuleDetails(), RuleRecord, formatAmount() (+3 more)

### Community 100 - "bonus-offer-admin-assign-dialog.tsx"
Cohesion: 0.26
Nodes (12): BonusOfferAdminAssignDialog(), handleAssign(), handleLoadAccounts(), handleOpenChange(), resetState(), BonusOfferAdminAssignDialogProps, formatAccountBalance(), formatMajorAmount() (+4 more)

### Community 101 - "risk-metrics-share-dialog.tsx"
Cohesion: 0.26
Nodes (11): DialogTrigger(), createRiskMetricShare(), getAccountRiskMetricShare(), updateRiskMetricShare(), buildShareUrl(), RiskMetricsShareDialog(), handleCopyLink(), handleDisable() (+3 more)

### Community 103 - "package.json"
Cohesion: 0.25
Nodes (7): name, pnpm, onlyBuiltDependencies, private, version, sharp, unrs-resolver

### Community 104 - "IbProgramsView"
Cohesion: 0.18
Nodes (3): IbProgramsView(), ibProgramPaymentRulesPath(), ibProgramSymbolsPath()

### Community 105 - "login-form.tsx"
Cohesion: 0.16
Nodes (13): formAction(), LoginForm(), LoginFormProps, twoFaPrompt(), LogoutButton(), LogoutButtonProps, DEFAULT_POST_LOGIN, AuthArea (+5 more)

### Community 106 - "area-switcher.tsx"
Cohesion: 0.43
Nodes (5): AreaSwitcher(), areaTabs, APP_AREAS, AppAreaId, resolveAppArea()

### Community 107 - "client-insurances-view.tsx"
Cohesion: 0.18
Nodes (20): AccountTarget, ClientInsuranceContractDialog(), ClientInsuranceContractDialogProps, ClientInsuranceEligibleAccountsDialog(), ClientInsuranceEligibleAccountsDialogProps, clientInsuranceBreadcrumbs, clientAccountInsuranceStatusLabel(), clientAccountInsuranceStatusVariant() (+12 more)

### Community 108 - "IbPaymentTemplatesView"
Cohesion: 0.14
Nodes (4): IbPaymentTemplateLevelsDialog(), IbPaymentTemplatesView(), summarizeLevels(), formatPaymentTemplateRate()

### Community 109 - "listServerGroupsForAdmin"
Cohesion: 0.13
Nodes (13): loadGroups(), loadServerGroupOptionsForPlatform(), loadData(), loadData(), loadData(), getTradingServer(), listServerGroups(), listServerGroupsForAdmin() (+5 more)

### Community 110 - "client-analytics-temporal-panel.tsx"
Cohesion: 0.20
Nodes (14): ClientAnalyticsTemporalPanelProps, DurationScatterPlot(), formatHours(), formatNumber(), formatPercent(), formatSignedCurrency(), heatCellColor(), HourWeekdayHeatmap() (+6 more)

### Community 111 - "PositionsReportView"
Cohesion: 0.20
Nodes (6): activeCount(), datetimeInput(), fromSearch(), PositionsReportView(), apply(), onEnter()

### Community 112 - "listServerGroupLeverages"
Cohesion: 0.33
Nodes (5): listServerGroupLeverages(), synchronizeServerGroupLeverages(), ServerGroupLeveragesSyncDialog(), handleSubmit(), loadLeverages()

### Community 113 - "FormsListView"
Cohesion: 0.29
Nodes (8): builderPath(), editableVersion(), formatVersionDate(), FormsListView(), create(), openEditor(), openPreview(), previewVersion()

### Community 114 - "TradingAccountResetCredentialsDialog"
Cohesion: 0.67
Nodes (3): TradingAccountResetCredentialsDialog(), handleConfirm(), validateForm()

### Community 115 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 116 - "bonus-assignment-logs/api.ts"
Cohesion: 0.19
Nodes (12): cancelBonusAssignment(), compactFilters(), listBonusAssignments(), listBonusNegativeBalanceCompensations(), listDepositBonusIntents(), CancelBonusAssignmentDialog(), submit(), NegativeBalanceRebalancesDataTable() (+4 more)

### Community 117 - "bonus-offer-server-groups-dialog.tsx"
Cohesion: 0.31
Nodes (9): toServerGroupOption(), BonusOfferServerGroupsDialog(), handleSubmit(), BonusOfferServerGroupsDialogProps, ServerGroupOption, toServerGroupOption(), formatServerGroupOptionLabel(), getServerGroupCurrency() (+1 more)

### Community 118 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 119 - "TradingSymbolsView"
Cohesion: 0.20
Nodes (5): TradingSymbolsPageProps, listSymbols(), formToAppliedFilters(), TradingSymbolsView(), applyFilters()

### Community 120 - "PositionHistoryView"
Cohesion: 0.25
Nodes (5): listGlobalPositions(), fromSearch(), historyTab(), PositionHistoryView(), apply()

### Community 121 - "browserBrokerRequest"
Cohesion: 0.12
Nodes (24): ClientContestDetailPageProps, compactFilters(), getContestLeaderboardTop(), getContestSubscription(), getPublicContest(), listContestLeaderboard(), listPublicContestConditions(), listPublicContests() (+16 more)

### Community 122 - "subscriptionStatusLabel"
Cohesion: 0.32
Nodes (7): adminLabel(), IbPlanSubscriptionAdminInteractionsDialog(), loadInteractions(), IbPlanSubscriptionDetailDialog(), formatDateTime(), subscriptionStatusLabel(), subscriptionStatusVariant()

### Community 124 - "browser-client.ts"
Cohesion: 0.32
Nodes (6): BrowserBrokerRequestOptions, buildSearch(), serializeSearchParamValue(), BrowserIamRequestOptions, BrokerSuccessResponse, isBrokerSuccessResponse()

### Community 125 - "account-insurance-claim-dialogs.tsx"
Cohesion: 0.29
Nodes (6): AccountInsuranceApproveDialog(), handleApprove(), AccountInsuranceApproveDialogProps, AccountInsuranceRejectDialog(), handleReject(), AccountInsuranceRejectDialogProps

### Community 126 - "IbPaymentTemplateFormDialog"
Cohesion: 0.40
Nodes (4): createLevelDraft(), IbPaymentTemplateFormDialog(), addLevel(), handleSubmit()

### Community 127 - "jwf-submission-readonly.tsx"
Cohesion: 0.47
Nodes (5): displayValue(), findForm(), JwfSubmissionReadonly(), ReadonlyNode(), IbPlanSubscriptionFormSubmission

### Community 128 - "trading-account-access-dialog.tsx"
Cohesion: 0.33
Nodes (5): ACTION_COPY, RESTRICTING_ACTIONS, TradingAccountAccessDialog(), handleConfirm(), TradingAccountAccessDialogProps

### Community 129 - "initial-amount-delete-dialog.tsx"
Cohesion: 0.50
Nodes (4): deleteInitialAmount(), InitialAmountDeleteDialog(), handleDelete(), InitialAmountDeleteDialogProps

### Community 130 - "handleSubmit"
Cohesion: 0.67
Nodes (3): handleSubmit(), successMessage(), toRequestBody()

### Community 131 - "useIsMobile"
Cohesion: 0.70
Nodes (4): getIsMobileServerSnapshot(), getIsMobileSnapshot(), subscribeToMobileQuery(), useIsMobile()

### Community 132 - "contest-global-settings-view.tsx"
Cohesion: 0.50
Nodes (3): emptyForm, FormState, settingsBreadcrumbs

### Community 135 - "OpenPositionDialog"
Cohesion: 1.00
Nodes (3): OpenPositionDialog(), handleSubmit(), resetForm()

## Knowledge Gaps
- **536 isolated node(s):** `AdminLoginPageProps`, `ClientLoginPageProps`, `AccountMetricsPageProps`, `Props`, `ClientContestDetailPageProps` (+531 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatBrokerApiError()` connect `formatBrokerApiError` to `contest/api.ts`, `skeleton.tsx`, `ib-program-payment-rule-form-dialog.tsx`, `insurance/index.ts`, `errors.ts`, `api-error-alert.tsx`, `alert-dialog.tsx`, `scheduling/api.ts`, `ib-plan-subscription/index.ts`, `ib-payment-template-level-form-dialog.tsx`, `client-contest-subscribe-dialog.tsx`, `client-risk-metrics/api.ts`, `bonus-assignment-logs-view.tsx`, `platform/api.ts`, `ib-volume-reward-trades-report-view.tsx`, `client-ib-progression-panel.tsx`, `form-builder-view.tsx`, `positions/api.ts`, `public-risk-metrics-view.tsx`, `form-document.ts`, `ib-analytics/api.ts`, `contest-workspace-panels.tsx`, `trading-server/format.ts`, `ib-plan-programs-sync-view.tsx`, `risk-control/api.ts`, `client-bonus-assignment-detail-dialog.tsx`, `bonus-offer-delete-dialog.tsx`, `client-analytics-behavior-panel.tsx`, `ib-volume-reward-trades/types.ts`, `card.tsx`, `bonus-offer-form-dialog.tsx`, `client-analytics-profitability-panel.tsx`, `IbProgramSymbolsView`, `ib-reward-logs/index.ts`, `client-insurance/api.ts`, `ib-plan/api.ts`, `BonusOfferTemplatesView`, `site-header.tsx`, `bonus-offer-template-form-dialog.tsx`, `bonus-offers-view.tsx`, `client-trading-account/api.ts`, `position-history-view.tsx`, `configuration/api.ts`, `client-analytics-dashboard-panel.tsx`, `bonus-assignment-detail-dialog.tsx`, `ib-program/api.ts`, `ib-reward/index.ts`, `TradingAccountsView`, `getTradingServerForAdmin`, `server-group-edit-sheet.tsx`, `client-analytics-symbol-panel.tsx`, `symbol-category/api.ts`, `client-bonus/api.ts`, `ClientPositionsPanel`, `client-analytics-risk-drawdown-panel.tsx`, `IbPlanSubscriptionsView`, `BonusAssignmentLogsView`, `ContestSubscriptionsView`, `leverage-form-dialog.tsx`, `BonusExcludedInstrumentsView`, `client-positions/api.ts`, `ClientTradingAccountsView`, `listIbPlanPrograms`, `ib-progression-template/api.ts`, `contest-general-form.tsx`, `parse-broker-error.ts`, `ContestBansDialog`, `InitialAmountServerGroupsDialog`, `TradingServerGroupsView`, `LeveragesView`, `ib-subscription-form-dialog.tsx`, `config-form.ts`, `SiteHeader`, `ContestConditionsView`, `IbPlansView`, `ib-program-payment-rules-view.tsx`, `bonus-offer-admin-assign-dialog.tsx`, `risk-metrics-share-dialog.tsx`, `InitialAmountsView`, `IbProgramsView`, `client-insurances-view.tsx`, `IbPaymentTemplatesView`, `listServerGroupsForAdmin`, `client-analytics-temporal-panel.tsx`, `PositionsReportView`, `listServerGroupLeverages`, `FormsListView`, `TradingAccountResetCredentialsDialog`, `bonus-assignment-logs/api.ts`, `bonus-offer-server-groups-dialog.tsx`, `TradingSymbolsView`, `PositionHistoryView`, `browserBrokerRequest`, `subscriptionStatusLabel`, `RejectionTemplatesView`, `account-insurance-claim-dialogs.tsx`, `IbPaymentTemplateFormDialog`, `trading-account-access-dialog.tsx`, `initial-amount-delete-dialog.tsx`, `handleSubmit`, `contest-global-settings-view.tsx`, `trading-account-positions-dialog.tsx`, `client-positions-panel.tsx`, `OpenPositionDialog`?**
  _High betweenness centrality (0.228) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `skeleton.tsx`, `ib-program-payment-rule-form-dialog.tsx`, `insurance/index.ts`, `contest-global-settings-view.tsx`, `errors.ts`, `api-error-alert.tsx`, `alert-dialog.tsx`, `scheduling/api.ts`, `IbProgramFormDialog`, `bonus-assignment-logs-view.tsx`, `ib-volume-reward-trades-report-view.tsx`, `client-ib-progression-panel.tsx`, `form-builder-view.tsx`, `form-document.ts`, `ib-analytics/api.ts`, `contest-workspace-panels.tsx`, `ib-plan-programs-sync-view.tsx`, `dashboard-breadcrumbs.tsx`, `bonus-offer-delete-dialog.tsx`, `client-analytics-behavior-panel.tsx`, `ib-volume-reward-trades/types.ts`, `card.tsx`, `client-analytics-profitability-panel.tsx`, `IbProgramSymbolsView`, `ib-reward-logs/index.ts`, `client-insurance/api.ts`, `client-risk-metrics-view.tsx`, `site-header.tsx`, `client-analytics-dashboard-panel.tsx`, `ib-reward/index.ts`, `TradingAccountsView`, `server-group-edit-sheet.tsx`, `client-analytics-symbol-panel.tsx`, `client-analytics-risk-drawdown-panel.tsx`, `BonusAssignmentLogsView`, `BonusExcludedInstrumentsView`, `tooltip.tsx`, `listIbPlanPrograms`, `trading-account-actions-menu.tsx`, `ContestBansDialog`, `ib-program-payment-rules-view.tsx`, `IbProgramsView`, `area-switcher.tsx`, `client-insurances-view.tsx`, `client-analytics-temporal-panel.tsx`, `PositionsReportView`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `browserBrokerRequest()` connect `browserBrokerRequest` to `contest/api.ts`, `initial-amount-delete-dialog.tsx`, `ib-program-payment-rule-form-dialog.tsx`, `insurance/index.ts`, `scheduling/api.ts`, `ib-plan-subscription/index.ts`, `ib-payment-template-level-form-dialog.tsx`, `formatBrokerApiError`, `client-contest-subscribe-dialog.tsx`, `client-risk-metrics/api.ts`, `trading-server/api.ts`, `platform/api.ts`, `ib-volume-reward-trades-report-view.tsx`, `client-ib-progression-panel.tsx`, `form-builder-view.tsx`, `positions/api.ts`, `public-risk-metrics-view.tsx`, `ib-analytics/api.ts`, `contest-workspace-panels.tsx`, `bonus-offer/api.ts`, `risk-control/api.ts`, `client-bonus-assignment-detail-dialog.tsx`, `trading-account/api.ts`, `bonus-offer-delete-dialog.tsx`, `client-analytics-behavior-panel.tsx`, `ib-volume-reward-trades/types.ts`, `bonus-offer-form-dialog.tsx`, `IbProgramSymbolsView`, `ib-reward-logs/index.ts`, `client-insurance/api.ts`, `ib-plan/api.ts`, `bonus-offer-template-form-dialog.tsx`, `bonus-offers-view.tsx`, `client-trading-account/api.ts`, `position-history-view.tsx`, `configuration/api.ts`, `bonus-assignment-detail-dialog.tsx`, `use-account-positions-channel.ts`, `ib-program/api.ts`, `ib-reward/index.ts`, `getTradingServerForAdmin`, `client-analytics-symbol-panel.tsx`, `symbol-category/api.ts`, `client-bonus/api.ts`, `ClientPositionsPanel`, `ContestSubscriptionsView`, `leverage-form-dialog.tsx`, `client-positions/api.ts`, `ib-progression-template/api.ts`, `initial-amount/api.ts`, `contest-general-form.tsx`, `ContestBansDialog`, `InitialAmountServerGroupsDialog`, `ib-subscription-form-dialog.tsx`, `ib-program-payment-rules-view.tsx`, `risk-metrics-share-dialog.tsx`, `listServerGroupsForAdmin`, `listServerGroupLeverages`, `bonus-assignment-logs/api.ts`, `TradingSymbolsView`, `PositionHistoryView`, `browser-client.ts`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **What connects `AdminLoginPageProps`, `ClientLoginPageProps`, `AccountMetricsPageProps` to the rest of the system?**
  _536 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `contest/api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07486338797814207 - nodes in this community are weakly interconnected._
- **Should `skeleton.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08064842958459979 - nodes in this community are weakly interconnected._
- **Should `insurance/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05087719298245614 - nodes in this community are weakly interconnected._