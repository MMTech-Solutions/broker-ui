# Graph Report - mmt-broker-basic-ui  (2026-09-21)

## Corpus Check
- 432 files · ~179,423 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3105 nodes · 11641 edges · 148 communities (117 shown, 31 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.59)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `66817b06`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- browserBrokerRequest
- skeleton.tsx
- ib-program-payment-rules-view.tsx
- account-insurances-admin-view.tsx
- cn
- button.tsx
- trading-server-groups-view.tsx
- errors.ts
- scheduled-commands-view.tsx
- ib-plan-subscriptions-view.tsx
- api-error-alert.tsx
- formatBrokerApiError
- client-contest-detail-view.tsx
- client-risk-metrics/api.ts
- trading-server/api.ts
- bonus-assignment-logs-view.tsx
- bonus-offers-view.tsx
- ib-volume-reward-trades-report-view.tsx
- client-ib-progression-panel.tsx
- forms-view.tsx
- broker-response.ts
- public-risk-metrics-view.tsx
- client-risk-metrics/types.ts
- form-document.ts
- broker-client.ts
- ib-analytics-view.tsx
- client-contests-view.tsx
- bonus-offer/api.ts
- trading-server/format.ts
- ib-plan-programs-sync-view.tsx
- risk-control-view.tsx
- client-bonuses-view.tsx
- form-builder-view.tsx
- trading-accounts-view.tsx
- rejection-reason-composer.tsx
- client-analytics-behavior-panel.tsx
- ib-volume-reward-trades/types.ts
- card.tsx
- bonus-offer-form-dialog.tsx
- client-analytics-profitability-panel.tsx
- IbProgramSymbolsView
- ib-reward-logs-view.tsx
- compilerOptions
- client-insurance/api.ts
- client-risk-metrics-view.tsx
- ib-plan/api.ts
- SiteHeader
- site-header.tsx
- bonus-offer-template/api.ts
- login-form.tsx
- BonusOffersView
- client-trading-account/api.ts
- auth.ts
- position-history-view.tsx
- browser-client.ts
- client-analytics-dashboard-panel.tsx
- components.json
- bonus-assignment-detail-dialog.tsx
- use-account-positions-channel.ts
- session.server.ts
- ib-program/api.ts
- ib-reward/index.ts
- TradingAccountsView
- lib/utils.ts
- server-group-edit-sheet.tsx
- devDependencies
- dependencies
- client-analytics-symbol-panel.tsx
- symbol-categories-view.tsx
- client-bonus/api.ts
- trading-account-positions-dialog.tsx
- client-analytics-risk-drawdown-panel.tsx
- IbPlanSubscriptionsView
- BonusAssignmentLogsView
- use-trading-stream-positions-channel.ts
- ContestSubscriptionsView
- leverage/api.ts
- listServerGroupsForAdmin
- tooltip.tsx
- client-positions/api.ts
- ClientTradingAccountsView
- ib-plan-subscription-form-dialog.tsx
- ClientInsurancesView
- client-positions-panel.tsx
- initial-amount/api.ts
- initial-amount-form-dialog.tsx
- trading-account-actions-menu.tsx
- BrokerApiError
- ContestBansDialog
- formatInitialAmount
- TradingServerGroupsView
- LeveragesView
- ib-subscription-form-dialog.tsx
- config-form.ts
- session-constants.ts
- broker/[...path]/route.ts
- ContestAwardsView
- ContestConditionsView
- IbPlansView
- listEligibleIntroducingBrokers
- BonusOfferAdminAssignDialog
- RiskMetricsShareDialog
- InitialAmountsView
- package.json
- IbProgramsView
- PlatformsView
- area-switcher.tsx
- ClientInsuranceContractDialog
- IbPaymentTemplateLevelsDialog
- TradingServersView
- SymbolCategoriesView
- insurance-plan-option-form-dialog.tsx
- listServerGroupLeverages
- bonus-offer-admin-assign-dialog.tsx
- resetTradingAccountCredentials
- scripts
- NegativeBalanceRebalancesDataTable
- syncBonusOfferServerGroups
- README.md
- metrics/page.tsx
- accounts/[accountId]/risk-control/page.tsx
- client/contests/[contestId]/page.tsx
- programs/page.tsx
- subscriptions/page.tsx
- trading-servers/page.tsx
- [tradingServerId]/securities/page.tsx
- [securityId]/symbols/page.tsx
- server-groups/page.tsx
- [serverGroupId]/securities/page.tsx
- handleSave
- handleSubmit
- class-variance-authority
- eslint.config.mjs
- ib-program-payment-rule/routes.ts
- ib-program-symbol/routes.ts
- truncateId
- laravel-echo
- next.config.ts
- pusher-js
- react
- react-dom
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `formatBrokerApiError()` - 363 edges
2. `browserBrokerRequest()` - 259 edges
3. `cn()` - 226 edges
4. `ApiErrorAlert()` - 144 edges
5. `Button()` - 132 edges
6. `Skeleton()` - 93 edges
7. `Label()` - 86 edges
8. `Input()` - 80 edges
9. `DialogContent()` - 64 edges
10. `DialogHeader()` - 64 edges

## Surprising Connections (you probably didn't know these)
- `handle()` --calls--> `proxyBrokerRequest()`  [EXTRACTED]
  app/api/broker/[...path]/route.ts → lib/api/broker-client.ts
- `BreadcrumbEllipsis()` --calls--> `cn()`  [EXTRACTED]
  components/ui/breadcrumb.tsx → lib/utils.ts
- `DropdownMenuLabel()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts
- `SheetOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sheet.tsx → lib/utils.ts
- `handleSubscribe()` --calls--> `formatBrokerApiError()`  [EXTRACTED]
  features/client-ib/components/client-ib-plan-card.tsx → lib/api/errors.ts

## Import Cycles
- None detected.

## Communities (148 total, 31 thin omitted)

### Community 0 - "browserBrokerRequest"
Cohesion: 0.06
Nodes (89): activateContest(), assignContestAward(), assignContestCondition(), buildServerGroupLabel(), cancelContest(), createContest(), createContestAward(), createContestCondition() (+81 more)

### Community 1 - "skeleton.tsx"
Cohesion: 0.13
Nodes (52): ActionTooltipButton(), ActionTooltipButtonProps, PageContentToolbar(), PageContentToolbarProps, Badge(), badgeVariants, Input(), Skeleton() (+44 more)

### Community 2 - "ib-program-payment-rules-view.tsx"
Cohesion: 0.06
Nodes (55): createIbPaymentTemplate(), createIbPaymentTemplateLevel(), deleteIbPaymentTemplate(), deleteIbPaymentTemplateLevel(), listIbPaymentTemplates(), updateIbPaymentTemplateLevel(), createLevelDraft(), IbPaymentTemplateFormDialog() (+47 more)

### Community 3 - "account-insurances-admin-view.tsx"
Cohesion: 0.06
Nodes (58): approveAccountInsuranceClaim(), compactFilters(), createInsurancePlan(), createInsurancePlanOption(), deleteInsurancePlan(), deleteInsurancePlanOption(), getInsurancePlan(), listAccountInsurancesAdmin() (+50 more)

### Community 4 - "cn"
Cohesion: 0.05
Nodes (61): AppAreaBar(), AppAreaBarProps, AppSidebar(), bonusNavigation, contestsNavigation, ibNavigation, insuranceNavigation, reportsNavigation (+53 more)

### Community 5 - "button.tsx"
Cohesion: 0.09
Nodes (43): BrokerRequestCredentialsProps, CredentialValue(), Button(), buttonVariants, Dialog(), DialogContent(), DialogDescription(), DialogFooter() (+35 more)

### Community 6 - "trading-server-groups-view.tsx"
Cohesion: 0.06
Nodes (41): PageNumberPagination(), Alert(), AlertDescription(), AlertTitle(), alertVariants, contestsBreadcrumbs, statusLabels, getTradingServerForAdmin() (+33 more)

### Community 7 - "errors.ts"
Cohesion: 0.14
Nodes (37): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogTitle() (+29 more)

### Community 8 - "scheduled-commands-view.tsx"
Cohesion: 0.08
Nodes (49): ACTIVE_RUN_BLOCK_MESSAGE, hasActiveScheduledCommandRun(), buildListSearchParams(), cancelScheduledCommandRun(), getScheduledCommand(), listScheduledCommands(), runScheduledCommand(), updateScheduledCommand() (+41 more)

### Community 9 - "ib-plan-subscriptions-view.tsx"
Cohesion: 0.08
Nodes (51): adminSubscriptionsPath(), createIbPlanSubscription(), getIbPlanSubscriptionFormSubmission(), listIbPlanSubscriptionAdminInteractions(), listIbPlanSubscriptions(), toSearchParams(), updateIbPlanSubscription(), updateIbPlanSubscriptionParameters() (+43 more)

### Community 10 - "api-error-alert.tsx"
Cohesion: 0.11
Nodes (37): ApiErrorAlert(), ApiErrorAlertProps, buildPageItems(), PAGE_SIZE_OPTIONS, PageNumberPaginationProps, subscribeToHydration(), Label(), SelectContent() (+29 more)

### Community 11 - "formatBrokerApiError"
Cohesion: 0.05
Nodes (51): BonusOfferDeleteDialog(), handleDelete(), BonusOfferTemplateDeleteDialog(), handleDelete(), updateAssignedContestCondition(), ContestAssignedConditionsDialog(), handleAssign(), handleSortOrderChange() (+43 more)

### Community 12 - "client-contest-detail-view.tsx"
Cohesion: 0.09
Nodes (41): ClientContestsPage(), compactFilters(), getContestBannerUrl(), getContestLeaderboardTop(), getContestRegistrationOptions(), getContestSubscription(), getPublicContest(), getPublicContestGlobalSettings() (+33 more)

### Community 13 - "client-risk-metrics/api.ts"
Cohesion: 0.07
Nodes (46): analyticsOverviewInflight, analyticsOverviewRequestKey(), getAccountAnalyticsBehavior(), getAccountAnalyticsDaily(), getAccountAnalyticsDrawdowns(), getAccountAnalyticsDurationScatter(), getAccountAnalyticsEquityCurve(), getAccountAnalyticsOverview() (+38 more)

### Community 14 - "trading-server/api.ts"
Cohesion: 0.10
Nodes (42): cachedEnvironmentsByAudience, configSchemasByPlatform, configSchemasDeniedPlatforms, createTradingServer(), deleteTradingServer(), getTradingServer(), listCatalogServerGroups(), listSecurities() (+34 more)

### Community 15 - "bonus-assignment-logs-view.tsx"
Cohesion: 0.11
Nodes (36): cancelBonusAssignment(), compactFilters(), listBonusAssignments(), listBonusNegativeBalanceCompensations(), listDepositBonusIntents(), breadcrumbs, ColumnSortHeadProps, logsTabs (+28 more)

### Community 16 - "bonus-offers-view.tsx"
Cohesion: 0.10
Nodes (31): bonusOfferExcludedInstrumentsPath(), bonusOfferTemplateExcludedInstrumentsPath(), bonusOffersBreadcrumbs, bonusOfferTypeLabels, ColumnSortHeadProps, formToAppliedFilters(), parseOptionalNumber(), bonusOfferTemplatesBreadcrumbs (+23 more)

### Community 17 - "ib-volume-reward-trades-report-view.tsx"
Cohesion: 0.11
Nodes (34): getIbVolumeRewardTradeRewards(), DEFAULT_FILTERS, EMPTY_DRAFT, FilterDraft, identity(), paymentTemplateLabel(), planProgramLabel(), serverGroup() (+26 more)

### Community 18 - "client-ib-progression-panel.tsx"
Cohesion: 0.11
Nodes (30): compactFilters(), getActiveIbPlanContext(), getMyIbPlanSubscription(), listClientIbPlans(), listMyIbPlanProgressionLogs(), subscribeToIbPlan(), withProxyClientPlan(), withProxyProgramImage() (+22 more)

### Community 19 - "forms-view.tsx"
Cohesion: 0.08
Nodes (33): archiveFormVersion(), cloneFormVersion(), createForm(), deleteForm(), getFormVersion(), listForms(), publishFormVersion(), saveFormDraft() (+25 more)

### Community 20 - "broker-response.ts"
Cohesion: 0.09
Nodes (25): buildPositionsReportSearchParams(), exportPositionsReport(), listPositionsReport(), activeCount(), datetimeInput(), DEFAULT_FILTERS, fromSearch(), PositionsReportView() (+17 more)

### Community 21 - "public-risk-metrics-view.tsx"
Cohesion: 0.08
Nodes (27): PublicRiskMetricsPageProps, getPublicRiskMetricsSummary(), applyLiveEquityChange(), applyRiskMetricChanges(), parseMetricJsonValue(), toUnixSecond(), toUtcDateKey(), onChange() (+19 more)

### Community 22 - "client-risk-metrics/types.ts"
Cohesion: 0.05
Nodes (38): AnalyticsCumulativePnl, AnalyticsDailyDayBehavior, AnalyticsDailyStats, AnalyticsDailyStreakSegment, AnalyticsDailyTradeRow, AnalyticsDailyTransitionMatrix, AnalyticsDurationScatterPoint, AnalyticsEquityCurvePoint (+30 more)

### Community 23 - "form-document.ts"
Cohesion: 0.11
Nodes (32): FormBuilderPageProps, elementTitle(), FormBuilderView(), addElement(), changeDocument(), dropIntoContainer(), removeElement(), updateElement() (+24 more)

### Community 24 - "broker-client.ts"
Cohesion: 0.12
Nodes (25): buildIamUpstreamUrl(), DELETE, GET, handle(), PATCH, POST, PUT, RouteContext (+17 more)

### Community 25 - "ib-analytics-view.tsx"
Cohesion: 0.11
Nodes (25): getIbAnalyticsMonthly(), getIbAnalyticsSummary(), getIbAnalyticsYtd(), listIbAnalyticsRewards(), path(), toSearchParams(), AnalyticsTab, bucketTime() (+17 more)

### Community 26 - "client-contests-view.tsx"
Cohesion: 0.10
Nodes (27): tabs, listPublicContests(), CLIENT_CONTEST_STATUSES, clientContestsBreadcrumbs, ClientContestsView(), loadSettings(), statusLabels, statusLabelsEs (+19 more)

### Community 27 - "bonus-offer/api.ts"
Cohesion: 0.14
Nodes (32): adminAssignBonus(), deleteBonusOffer(), invalidateBonusOfferFormCatalog(), listBonusOfferTemplates(), listEligibleAccountsForBonusOfferAdmin(), loadBonusOfferFormCatalog(), AdminAssignBonusInput, AdminBonusAccountRequirement (+24 more)

### Community 28 - "trading-server/format.ts"
Cohesion: 0.10
Nodes (32): toServerGroupOption(), toServerGroupOption(), ClientTradingAccountCreateDialog(), loadLeverages(), enrichAccounts(), formatLeverageLabel(), listCatalogServerGroupLeverages(), emptyCountryRow() (+24 more)

### Community 29 - "ib-plan-programs-sync-view.tsx"
Cohesion: 0.13
Nodes (30): IbPlanProgramPivotFormDialog(), handleSubmit(), AvailableProgramItem(), handleDragStart(), formatProgressionMaxVolume(), IbPlanProgramsSyncView(), handleAssignedDrop(), handleDropOnAssigned() (+22 more)

### Community 30 - "risk-control-view.tsx"
Cohesion: 0.13
Nodes (29): archiveRiskControlRule(), createRiskControlRule(), listRiskControlExecutions(), listRiskControlRules(), loadRiskControlCatalog(), prefix(), updateRiskControlIdentity(), CreateDialog() (+21 more)

### Community 31 - "client-bonuses-view.tsx"
Cohesion: 0.16
Nodes (24): getClientBonusAssignment(), listAvailableBonusOffers(), ClientBonusAssignmentDetailDialog(), loadAssignment(), ClientBonusAssignmentDetailDialogProps, ClientBonusClaimDialog(), clientBonusesBreadcrumbs, ClientBonusesView() (+16 more)

### Community 32 - "form-builder-view.tsx"
Cohesion: 0.12
Nodes (25): DashboardBreadcrumbs(), DashboardBreadcrumbsProps, Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage() (+17 more)

### Community 33 - "trading-accounts-view.tsx"
Cohesion: 0.12
Nodes (28): TableFooter(), ListTradingAccountPositionsParams, listTradingAccounts(), ResetTradingAccountCredentialsInput, toSearchParams(), TradingAccountListMeta, TradingAccountListResponse, updateTradingAccount() (+20 more)

### Community 34 - "rejection-reason-composer.tsx"
Cohesion: 0.13
Nodes (21): compactFilters(), createRejectionTemplate(), deleteRejectionTemplate(), getRejectionTemplate(), listRejectionTemplates(), updateRejectionTemplate(), RejectionReasonComposer, RejectionReasonComposerProps (+13 more)

### Community 35 - "client-analytics-behavior-panel.tsx"
Cohesion: 0.10
Nodes (24): getAccountAnalyticsDailyDayTrades(), buildCalendarGrid(), CalendarMonthView(), CalendarViewMode, CalendarYearView(), ClientAnalyticsBehaviorPanel(), ClientAnalyticsBehaviorPanelProps, dailyKey() (+16 more)

### Community 36 - "ib-volume-reward-trades/types.ts"
Cohesion: 0.08
Nodes (25): buildReportSearchParams(), exportIbVolumeRewardTrades(), listIbVolumeRewardTrades(), IbVolumeRewardTradesReportView(), applyFilters(), download(), timestamp(), CalculationAvailability (+17 more)

### Community 37 - "card.tsx"
Cohesion: 0.15
Nodes (20): BrokerRequestCredentials(), Card(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle(), ClientIbPlanCardProps (+12 more)

### Community 38 - "bonus-offer-form-dialog.tsx"
Cohesion: 0.13
Nodes (25): createBonusOffer(), getBonusOffer(), syncBonusOfferIntroducingBrokers(), updateBonusOffer(), BonusOfferFormDialog(), handleSubmit(), loadFormData(), loadGroups() (+17 more)

### Community 39 - "client-analytics-profitability-panel.tsx"
Cohesion: 0.11
Nodes (19): AnalyticsPanelCard(), BreakEvenGauge(), ClientAnalyticsProfitabilityPanel(), ClientAnalyticsProfitabilityPanelProps, CumulativeGranularity, DirectionBreakdown(), ExpectancyContributionBar(), formatCurrency() (+11 more)

### Community 40 - "IbProgramSymbolsView"
Cohesion: 0.12
Nodes (21): ibProgramPath(), listAllIbProgramSymbols(), listIbProgramSymbols(), syncIbProgramSymbols(), IbProgramSymbolConfigSheet(), IbProgramSymbolsView(), handleAddSymbol(), handleSave() (+13 more)

### Community 41 - "ib-reward-logs-view.tsx"
Cohesion: 0.16
Nodes (20): compactFilters(), listIbRewardSettlementRuns(), listIbTradingAccountPeriodSnapshots(), breadcrumbs, FailedFilter, IbRewardLogsView(), isRewardLogTab(), tabLabels (+12 more)

### Community 42 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 43 - "client-insurance/api.ts"
Cohesion: 0.15
Nodes (24): compactFilters(), isInsuranceCandidateAccount(), listClientAccountInsurances(), listInsurancePlansForAccount(), loadAccountsWithInProgressInsurance(), loadClientInsuranceEligibleAccounts(), loadInsuranceEligibleAccountIds(), resolveEnvironmentByAccountId() (+16 more)

### Community 44 - "client-risk-metrics-view.tsx"
Cohesion: 0.10
Nodes (21): ANALYTICS_TABS, AnalyticsTab, applyAnalyticsUpdate(), applyDashboardMetrics(), applyPhaseMetricsUpdate(), ClientRiskMetricsView(), ClientRiskMetricsViewProps, DATE_RANGE_OPTIONS (+13 more)

### Community 45 - "ib-plan/api.ts"
Cohesion: 0.17
Nodes (25): appendIbPlanFormData(), createIbPlan(), deleteIbPlan(), listIbPlans(), mapIbPlanResponse(), mapIbPlansResponse(), seedIbDemoCatalog(), syncIbPlanPrograms() (+17 more)

### Community 46 - "SiteHeader"
Cohesion: 0.07
Nodes (3): Props, SiteHeader(), ContestCreateView()

### Community 48 - "bonus-offer-template/api.ts"
Cohesion: 0.15
Nodes (24): createBonusOfferTemplate(), deleteBonusOfferTemplate(), getBonusOfferTemplate(), listBonusOfferTemplates(), syncBonusOfferTemplateExcludedInstruments(), toSearchParams(), updateBonusOfferTemplate(), BonusOfferTemplateFormDialog() (+16 more)

### Community 49 - "login-form.tsx"
Cohesion: 0.15
Nodes (20): AdminLoginPage(), AdminLoginPageProps, ClientLoginPage(), ClientLoginPageProps, formAction(), LoginForm(), LoginFormProps, twoFaPrompt() (+12 more)

### Community 50 - "BonusOffersView"
Cohesion: 0.11
Nodes (15): BonusOffersView(), clearFilters(), commitFilters(), onFilterEnter(), patchDraft(), toggleSort(), formatExpiresAt(), BonusOfferTemplatesView() (+7 more)

### Community 51 - "client-trading-account/api.ts"
Cohesion: 0.12
Nodes (22): createClientTradingAccount(), listClientServerGroupsForSelection(), loadClientAccountCatalog(), startTradingCredentialsChallenge(), toClientServerGroup(), updateClientTradingAccountCredentials(), handleSubmit(), loadServerGroups() (+14 more)

### Community 52 - "auth.ts"
Cohesion: 0.19
Nodes (21): iamForwardHeaders(), LOGIN_PATH, loginAction(), logoutAction(), parseArea(), iamApiBase(), iamLogin(), iamLogout() (+13 more)

### Community 53 - "position-history-view.tsx"
Cohesion: 0.13
Nodes (16): PositionSide, listGlobalPositions(), listPositionCommissionRewards(), formatAmount(), PositionCommissionRewardsDialog(), loadRewards(), DEFAULTS, FILTER_KEYS (+8 more)

### Community 54 - "browser-client.ts"
Cohesion: 0.13
Nodes (19): listConfigs(), updateConfigsBatch(), ConfigurationView(), handleSave(), CATEGORY_LABELS, categoryLabel(), displayValueForForm(), groupConfigsByCategory() (+11 more)

### Community 55 - "client-analytics-dashboard-panel.tsx"
Cohesion: 0.16
Nodes (19): AnalyticsDashboardSnapshot, ChartToggleChip(), ClientAnalyticsDashboardPanel(), ClientAnalyticsDashboardPanelProps, formatCurrency(), formatMetric(), formatNumber(), formatPercent() (+11 more)

### Community 56 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 57 - "bonus-assignment-detail-dialog.tsx"
Cohesion: 0.24
Nodes (19): getBonusAssignment(), BonusAssignmentDetailDialog(), loadAssignment(), BonusAssignmentDetailDialogProps, abbreviateUuid(), AssignmentsTable(), DepositIntentsTable(), bonusAssignmentOfferLabel() (+11 more)

### Community 58 - "use-account-positions-channel.ts"
Cohesion: 0.16
Nodes (16): accountWatchPath(), heartbeatOpenPositionsWatch(), unwatchOpenPositions(), watchOpenPositions(), PositionsLiveStatus, useAccountPositionsChannel(), UseAccountPositionsChannelOptions, accountPositionsPrivateChannel() (+8 more)

### Community 59 - "session.server.ts"
Cohesion: 0.19
Nodes (18): ClientHomePage(), DashboardPage(), iamRefresh(), decodeJwtPayload(), displayNameFromClaims(), jwtPayloadSegment(), sessionCookieName(), decryptSession() (+10 more)

### Community 60 - "ib-program/api.ts"
Cohesion: 0.20
Nodes (16): appendIbProgramFormData(), createIbProgram(), deleteIbProgram(), listIbPrograms(), mapIbProgramResponse(), mapIbProgramsResponse(), updateIbProgram(), withProxyImagePath() (+8 more)

### Community 61 - "ib-reward/index.ts"
Cohesion: 0.20
Nodes (15): compactFilters(), listIbRewards(), IbRewardsView(), formatDateTimeValue(), formatMoneyValue(), paymentRuleTypeLabel(), paymentStatusLabel(), paymentStatusVariant() (+7 more)

### Community 62 - "TradingAccountsView"
Cohesion: 0.14
Nodes (15): abbreviateUuid(), formatMoney(), formToAppliedFilters(), parseOptionalNumber(), pnlClassName(), TradingAccountsView(), applyFiltersFromDraft(), changePage() (+7 more)

### Community 63 - "lib/utils.ts"
Cohesion: 0.14
Nodes (14): Checkbox(), emptyForm, FormState, IbPlanFormDialogProps, FormState, IbPlanSubscriptionParametersDialogProps, emptyForm, FormState (+6 more)

### Community 64 - "server-group-edit-sheet.tsx"
Cohesion: 0.18
Nodes (14): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), FormElementEditorSheet() (+6 more)

### Community 65 - "devDependencies"
Cohesion: 0.11
Nodes (19): babel-plugin-react-compiler, eslint, eslint-config-next, devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, tailwindcss (+11 more)

### Community 66 - "dependencies"
Cohesion: 0.11
Nodes (19): @base-ui/react, clsx, lightweight-charts, lucide-react, next, dependencies, @base-ui/react, clsx (+11 more)

### Community 67 - "client-analytics-symbol-panel.tsx"
Cohesion: 0.18
Nodes (17): getAccountAnalyticsSymbols(), ClientAnalyticsSymbolPanel(), load(), ClientAnalyticsSymbolPanelProps, formatNumber(), formatPercent(), formatSideLabel(), formatSymbolMetric() (+9 more)

### Community 68 - "symbol-categories-view.tsx"
Cohesion: 0.23
Nodes (15): compactFilters(), createSymbolCategory(), deleteSymbolCategory(), listAllSymbolCategories(), listSymbolCategories(), updateSymbolCategory(), breadcrumbs, SymbolCategoryDeleteDialog() (+7 more)

### Community 69 - "client-bonus/api.ts"
Cohesion: 0.16
Nodes (14): BonusAssignment, claimBonusOffer(), compactFilters(), listClientBonusAssignments(), listEligibleAccountsForBonusOffer(), handleSubmit(), loadAccounts(), BonusAssignmentStatus (+6 more)

### Community 70 - "trading-account-positions-dialog.tsx"
Cohesion: 0.21
Nodes (10): ClientPositionsPanel(), formatNumber(), formatOpenedAt(), formatSide(), HistoryPositionsTable(), LivePositionsTable(), listTradingAccountPositions(), PositionsTab (+2 more)

### Community 71 - "client-analytics-risk-drawdown-panel.tsx"
Cohesion: 0.20
Nodes (14): ClientAnalyticsRiskDrawdownPanel(), ClientAnalyticsRiskDrawdownPanelProps, formatCurrency(), formatDays(), formatNumber(), formatPercent(), formatSignedCurrency(), MetricRow() (+6 more)

### Community 72 - "IbPlanSubscriptionsView"
Cohesion: 0.15
Nodes (8): abbreviateUuid(), formToAppliedFilters(), IbPlanSubscriptionsView(), applyFiltersFromDraft(), clearFilters(), commitFilters(), onFilterEnter(), parseOptionalNumber()

### Community 73 - "BonusAssignmentLogsView"
Cohesion: 0.19
Nodes (13): assignmentFormToFilters(), BonusAssignmentLogsView(), clearFilters(), commitAssignmentFilters(), commitIntentFilters(), onAssignmentFilterEnter(), onIntentFilterEnter(), patchAssignmentDraft() (+5 more)

### Community 74 - "use-trading-stream-positions-channel.ts"
Cohesion: 0.17
Nodes (15): GatewayPosition, GatewayPositionsEvent, GatewaySubscriptionRejected, GatewayWelcomeFrame, isPositionsEvent(), isRecord(), isSubscriptionRejected(), isWelcomeFrame() (+7 more)

### Community 75 - "ContestSubscriptionsView"
Cohesion: 0.18
Nodes (13): ContestSubscriptionBanDialog(), handleBan(), abbreviateUuid(), ContestSubscriptionsView(), applyFiltersFromDraft(), clearFilters(), commitFilters(), handleContestChange() (+5 more)

### Community 76 - "leverage/api.ts"
Cohesion: 0.26
Nodes (13): compactFilters(), createLeverage(), deleteLeverage(), getLeverage(), LeverageAudience, listLeverages(), updateLeverage(), LeverageFormDialog() (+5 more)

### Community 77 - "listServerGroupsForAdmin"
Cohesion: 0.21
Nodes (12): BonusExcludedInstrumentsView(), handleAddSymbol(), ExcludedInstrumentDraft, draftsSignature(), excludedInstrumentFromApi(), excludedInstrumentFromTradingSymbol(), excludedInstrumentKey(), loadData() (+4 more)

### Community 78 - "tooltip.tsx"
Cohesion: 0.19
Nodes (10): geistMono, geistSans, metadata, Tooltip(), TooltipContent(), TooltipProvider(), TooltipTrigger(), BONUS_OFFER_FIELD_HELP (+2 more)

### Community 79 - "client-positions/api.ts"
Cohesion: 0.23
Nodes (12): accountHistoryPath(), accountPositionsPath(), closePosition(), listAccountPositions(), openPosition(), handleClose(), AccountPosition, ClosePositionInput (+4 more)

### Community 80 - "ClientTradingAccountsView"
Cohesion: 0.16
Nodes (6): ClientTradingAccountsView(), formatAccountMoney(), formatEnvironmentLabel(), moneyFormatter, parseServerGroupDefaultAmount(), serverGroupNeedsInitialAmount()

### Community 81 - "ib-plan-subscription-form-dialog.tsx"
Cohesion: 0.15
Nodes (13): listIbPlanPrograms(), emptyForm, FormState, IbPlanSubscriptionFormDialog(), handleSubmit(), loadPrograms(), IbPlanSubscriptionFormDialogProps, IbPlanSubscriptionPlacementDialog() (+5 more)

### Community 82 - "ClientInsurancesView"
Cohesion: 0.17
Nodes (8): cancelClientAccountInsurance(), claimClientAccountInsurance(), ClientInsurancesView(), handleCancel(), handleClaim(), clientAccountInsuranceStatusLabel(), clientAccountInsuranceStatusVariant(), formatInsuranceDateTime()

### Community 83 - "client-positions-panel.tsx"
Cohesion: 0.26
Nodes (10): applyOpenPositionsSnapshot(), normalizeLivePosition(), toSide(), toSortableTime(), ClientPositionsPanelProps, PositionsFilter, OpenPositionDialog(), handleSubmit() (+2 more)

### Community 84 - "initial-amount/api.ts"
Cohesion: 0.29
Nodes (9): compactFilters(), listClientInitialAmounts(), listInitialAmounts(), CreateInitialAmountInput, InitialAmount, InitialAmountListFilters, InitialAmountServerGroup, SyncInitialAmountServerGroupsInput (+1 more)

### Community 85 - "initial-amount-form-dialog.tsx"
Cohesion: 0.27
Nodes (10): createInitialAmount(), updateInitialAmount(), emptyForm, FormState, InitialAmountFormDialog(), handleSubmit(), InitialAmountFormDialogProps, minorUnitsToMajorValue() (+2 more)

### Community 86 - "trading-account-actions-menu.tsx"
Cohesion: 0.27
Nodes (9): DropdownMenu(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuSeparator(), DropdownMenuTrigger(), TradingAccountAccessAction, TradingAccountActionsMenu() (+1 more)

### Community 87 - "BrokerApiError"
Cohesion: 0.27
Nodes (8): BrokerApiError, BrowserIamRequestOptions, BrokerErrorDetails, extractValidationMessages(), humanizeValidationMessage(), isRecord(), parseBrokerErrorPayload(), ParsedBrokerError

### Community 88 - "ContestBansDialog"
Cohesion: 0.33
Nodes (10): abbreviateUuid(), ContestBansDialog(), applyFiltersFromDraft(), clearFilters(), commitFilters(), handleRevert(), onFilterEnter(), patchDraft() (+2 more)

### Community 89 - "formatInitialAmount"
Cohesion: 0.20
Nodes (9): deleteInitialAmount(), getInitialAmount(), syncInitialAmountServerGroups(), InitialAmountDeleteDialog(), handleDelete(), InitialAmountServerGroupsDialog(), handleSubmit(), loadData() (+1 more)

### Community 90 - "TradingServerGroupsView"
Cohesion: 0.20
Nodes (4): formToAppliedFilters(), TradingServerGroupsView(), applyFilters(), formatBookTypeLabel()

### Community 92 - "ib-subscription-form-dialog.tsx"
Cohesion: 0.33
Nodes (7): getIbPlanSubscriptionForm(), fieldErrors(), findForm(), IbSubscriptionFormDialog(), handleSubmit(), inputNodes(), Props

### Community 93 - "config-form.ts"
Cohesion: 0.36
Nodes (8): TradingServerFormDialog(), handleSubmit(), loadOptions(), buildEmptyConfig(), configFromTradingServer(), getDefaultSchemaId(), MASKED_SECRET_VALUE, serializeConfigForSubmit()

### Community 94 - "session-constants.ts"
Cohesion: 0.31
Nodes (7): ADMIN_2FA_COOKIE, ADMIN_SESSION_COOKIE, CLIENT_2FA_COOKIE, CLIENT_SESSION_COOKIE, config, hasValidSession(), middleware()

### Community 95 - "broker/[...path]/route.ts"
Cohesion: 0.25
Nodes (7): DELETE, GET, handle(), PATCH, POST, PUT, RouteContext

### Community 99 - "listEligibleIntroducingBrokers"
Cohesion: 0.29
Nodes (7): listBonusOffers(), listEligibleIntroducingBrokers(), toSearchParams(), loadEligibleIbs(), BonusOfferIntroducingBrokersDialog(), loadData(), sortedIdsSignature()

### Community 100 - "BonusOfferAdminAssignDialog"
Cohesion: 0.32
Nodes (8): BonusOfferAdminAssignDialog(), handleAssign(), handleLoadAccounts(), handleOpenChange(), resetState(), formatAccountBalance(), formatMajorAmount(), formatRewardSummary()

### Community 101 - "RiskMetricsShareDialog"
Cohesion: 0.32
Nodes (8): createRiskMetricShare(), getAccountRiskMetricShare(), updateRiskMetricShare(), buildShareUrl(), RiskMetricsShareDialog(), handleCopyLink(), handleDisable(), handleEnable()

### Community 103 - "package.json"
Cohesion: 0.25
Nodes (7): name, pnpm, onlyBuiltDependencies, private, version, sharp, unrs-resolver

### Community 106 - "area-switcher.tsx"
Cohesion: 0.43
Nodes (5): AreaSwitcher(), areaTabs, APP_AREAS, AppAreaId, resolveAppArea()

### Community 107 - "ClientInsuranceContractDialog"
Cohesion: 0.38
Nodes (7): contractClientAccountInsurance(), ClientInsuranceContractDialog(), handleSubmit(), formatAccountBalance(), formatCoveragePercent(), formatInsuranceMinorAmount(), formatInsuranceOptionSummary()

### Community 108 - "IbPaymentTemplateLevelsDialog"
Cohesion: 0.29
Nodes (3): IbPaymentTemplateLevelsDialog(), summarizeLevels(), formatPaymentTemplateRate()

### Community 111 - "insurance-plan-option-form-dialog.tsx"
Cohesion: 0.40
Nodes (5): emptyForm, FormState, InsurancePlanOptionFormDialog(), InsurancePlanOptionFormDialogProps, optionToForm()

### Community 112 - "listServerGroupLeverages"
Cohesion: 0.33
Nodes (5): listServerGroupLeverages(), synchronizeServerGroupLeverages(), ServerGroupLeveragesSyncDialog(), handleSubmit(), loadLeverages()

### Community 113 - "bonus-offer-admin-assign-dialog.tsx"
Cohesion: 0.60
Nodes (4): BonusOfferAdminAssignDialogProps, formatMinorAmount(), formatUnmetRequirement(), getUnmetSummaries()

### Community 114 - "resetTradingAccountCredentials"
Cohesion: 0.50
Nodes (4): resetTradingAccountCredentials(), TradingAccountResetCredentialsDialog(), handleConfirm(), validateForm()

### Community 115 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 116 - "NegativeBalanceRebalancesDataTable"
Cohesion: 0.67
Nodes (3): NegativeBalanceRebalancesDataTable(), applyFilters(), onFilterEnter()

### Community 117 - "syncBonusOfferServerGroups"
Cohesion: 0.50
Nodes (3): syncBonusOfferServerGroups(), BonusOfferServerGroupsDialog(), handleSubmit()

### Community 118 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 129 - "handleSave"
Cohesion: 0.67
Nodes (3): handleSave(), draftToSyncInput(), syncBonusExcludedInstruments()

### Community 130 - "handleSubmit"
Cohesion: 0.67
Nodes (3): handleSubmit(), successMessage(), toRequestBody()

## Knowledge Gaps
- **534 isolated node(s):** `AdminLoginPageProps`, `ClientLoginPageProps`, `AccountMetricsPageProps`, `Props`, `ClientContestDetailPageProps` (+529 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **31 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatBrokerApiError()` connect `formatBrokerApiError` to `browserBrokerRequest`, `skeleton.tsx`, `ib-program-payment-rules-view.tsx`, `account-insurances-admin-view.tsx`, `button.tsx`, `trading-server-groups-view.tsx`, `errors.ts`, `scheduled-commands-view.tsx`, `ib-plan-subscriptions-view.tsx`, `api-error-alert.tsx`, `client-contest-detail-view.tsx`, `client-risk-metrics/api.ts`, `bonus-assignment-logs-view.tsx`, `bonus-offers-view.tsx`, `ib-volume-reward-trades-report-view.tsx`, `client-ib-progression-panel.tsx`, `forms-view.tsx`, `broker-response.ts`, `public-risk-metrics-view.tsx`, `form-document.ts`, `ib-analytics-view.tsx`, `client-contests-view.tsx`, `trading-server/format.ts`, `ib-plan-programs-sync-view.tsx`, `risk-control-view.tsx`, `client-bonuses-view.tsx`, `form-builder-view.tsx`, `trading-accounts-view.tsx`, `rejection-reason-composer.tsx`, `client-analytics-behavior-panel.tsx`, `ib-volume-reward-trades/types.ts`, `card.tsx`, `bonus-offer-form-dialog.tsx`, `client-analytics-profitability-panel.tsx`, `IbProgramSymbolsView`, `ib-reward-logs-view.tsx`, `client-insurance/api.ts`, `ib-plan/api.ts`, `bonus-offer-template/api.ts`, `BonusOffersView`, `client-trading-account/api.ts`, `position-history-view.tsx`, `browser-client.ts`, `client-analytics-dashboard-panel.tsx`, `bonus-assignment-detail-dialog.tsx`, `ib-program/api.ts`, `ib-reward/index.ts`, `TradingAccountsView`, `lib/utils.ts`, `server-group-edit-sheet.tsx`, `client-analytics-symbol-panel.tsx`, `symbol-categories-view.tsx`, `client-bonus/api.ts`, `trading-account-positions-dialog.tsx`, `client-analytics-risk-drawdown-panel.tsx`, `IbPlanSubscriptionsView`, `BonusAssignmentLogsView`, `ContestSubscriptionsView`, `leverage/api.ts`, `listServerGroupsForAdmin`, `client-positions/api.ts`, `ClientTradingAccountsView`, `ib-plan-subscription-form-dialog.tsx`, `ClientInsurancesView`, `client-positions-panel.tsx`, `initial-amount-form-dialog.tsx`, `BrokerApiError`, `ContestBansDialog`, `formatInitialAmount`, `TradingServerGroupsView`, `LeveragesView`, `ib-subscription-form-dialog.tsx`, `config-form.ts`, `ContestAwardsView`, `ContestConditionsView`, `IbPlansView`, `listEligibleIntroducingBrokers`, `BonusOfferAdminAssignDialog`, `RiskMetricsShareDialog`, `InitialAmountsView`, `IbProgramsView`, `PlatformsView`, `ClientInsuranceContractDialog`, `TradingServersView`, `SymbolCategoriesView`, `insurance-plan-option-form-dialog.tsx`, `listServerGroupLeverages`, `bonus-offer-admin-assign-dialog.tsx`, `resetTradingAccountCredentials`, `NegativeBalanceRebalancesDataTable`, `syncBonusOfferServerGroups`, `handleSave`, `handleSubmit`?**
  _High betweenness centrality (0.282) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `skeleton.tsx`, `ib-program-payment-rules-view.tsx`, `account-insurances-admin-view.tsx`, `button.tsx`, `trading-server-groups-view.tsx`, `errors.ts`, `scheduled-commands-view.tsx`, `ib-plan-subscriptions-view.tsx`, `api-error-alert.tsx`, `formatBrokerApiError`, `client-risk-metrics/api.ts`, `bonus-assignment-logs-view.tsx`, `ib-volume-reward-trades-report-view.tsx`, `client-ib-progression-panel.tsx`, `forms-view.tsx`, `broker-response.ts`, `form-document.ts`, `ib-analytics-view.tsx`, `client-contests-view.tsx`, `ib-plan-programs-sync-view.tsx`, `form-builder-view.tsx`, `trading-accounts-view.tsx`, `rejection-reason-composer.tsx`, `client-analytics-behavior-panel.tsx`, `ib-volume-reward-trades/types.ts`, `card.tsx`, `client-analytics-profitability-panel.tsx`, `IbProgramSymbolsView`, `ib-reward-logs-view.tsx`, `client-risk-metrics-view.tsx`, `client-analytics-dashboard-panel.tsx`, `ib-program/api.ts`, `ib-reward/index.ts`, `TradingAccountsView`, `lib/utils.ts`, `server-group-edit-sheet.tsx`, `client-analytics-symbol-panel.tsx`, `client-analytics-risk-drawdown-panel.tsx`, `BonusAssignmentLogsView`, `listServerGroupsForAdmin`, `tooltip.tsx`, `ib-plan-subscription-form-dialog.tsx`, `ClientInsurancesView`, `trading-account-actions-menu.tsx`, `ContestBansDialog`, `IbProgramsView`, `area-switcher.tsx`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Why does `browserBrokerRequest()` connect `browserBrokerRequest` to `handleSave`, `ib-program-payment-rules-view.tsx`, `account-insurances-admin-view.tsx`, `scheduled-commands-view.tsx`, `ib-plan-subscriptions-view.tsx`, `formatBrokerApiError`, `client-contest-detail-view.tsx`, `client-risk-metrics/api.ts`, `trading-server/api.ts`, `bonus-assignment-logs-view.tsx`, `bonus-offers-view.tsx`, `ib-volume-reward-trades-report-view.tsx`, `client-ib-progression-panel.tsx`, `forms-view.tsx`, `broker-response.ts`, `public-risk-metrics-view.tsx`, `ib-analytics-view.tsx`, `client-contests-view.tsx`, `bonus-offer/api.ts`, `trading-server/format.ts`, `risk-control-view.tsx`, `client-bonuses-view.tsx`, `form-builder-view.tsx`, `trading-accounts-view.tsx`, `rejection-reason-composer.tsx`, `client-analytics-behavior-panel.tsx`, `ib-volume-reward-trades/types.ts`, `bonus-offer-form-dialog.tsx`, `IbProgramSymbolsView`, `ib-reward-logs-view.tsx`, `client-insurance/api.ts`, `ib-plan/api.ts`, `bonus-offer-template/api.ts`, `client-trading-account/api.ts`, `position-history-view.tsx`, `browser-client.ts`, `bonus-assignment-detail-dialog.tsx`, `use-account-positions-channel.ts`, `ib-program/api.ts`, `ib-reward/index.ts`, `client-analytics-symbol-panel.tsx`, `symbol-categories-view.tsx`, `client-bonus/api.ts`, `trading-account-positions-dialog.tsx`, `leverage/api.ts`, `listServerGroupsForAdmin`, `client-positions/api.ts`, `ClientInsurancesView`, `initial-amount/api.ts`, `initial-amount-form-dialog.tsx`, `formatInitialAmount`, `ib-subscription-form-dialog.tsx`, `listEligibleIntroducingBrokers`, `RiskMetricsShareDialog`, `ClientInsuranceContractDialog`, `listServerGroupLeverages`, `resetTradingAccountCredentials`, `syncBonusOfferServerGroups`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **What connects `AdminLoginPageProps`, `ClientLoginPageProps`, `AccountMetricsPageProps` to the rest of the system?**
  _534 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `browserBrokerRequest` be split into smaller, more focused modules?**
  _Cohesion score 0.05621500559910415 - nodes in this community are weakly interconnected._
- **Should `skeleton.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1277701778385773 - nodes in this community are weakly interconnected._
- **Should `ib-program-payment-rules-view.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06330988522769344 - nodes in this community are weakly interconnected._