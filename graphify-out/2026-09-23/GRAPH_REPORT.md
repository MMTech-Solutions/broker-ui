# Graph Report - mmt-broker-basic-ui  (2026-09-23)

## Corpus Check
- 453 files · ~188,752 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3277 nodes · 12141 edges · 140 communities (124 shown, 16 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b913a656`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- contest/api.ts
- broker-response.ts
- ib-program-payment-rule/api.ts
- insurance/index.ts
- cn
- client-risk-metrics/api.ts
- TradingServerSecuritySymbolsView
- alert-dialog.tsx
- scheduled-command-run-dialog.tsx
- ib-plan-subscription/index.ts
- client-trading-account/api.ts
- client-insurance/format.ts
- form-builder-view.tsx
- ib-admin-analytics-view.tsx
- trading-server/api.ts
- bonus-assignment-logs-view.tsx
- client-contest-detail-view.tsx
- ib-volume-reward-trades-report-view.tsx
- client-ib/api.ts
- forms-list-view.tsx
- formatBrokerApiError
- public-risk-metrics-view.tsx
- client-risk-metrics/types.ts
- form-document.ts
- broker-client.ts
- ib-rewards-view.tsx
- contest-workspace-panels.tsx
- bonus-offer/api.ts
- server-group-edit-sheet.tsx
- IbPlanProgramsSyncView
- risk-control/api.ts
- client-bonuses-view.tsx
- rejection-templates-view.tsx
- trading-accounts-view.tsx
- bonus-assignment-detail-dialog.tsx
- client-analytics-behavior-panel.tsx
- button.tsx
- card.tsx
- ib-payment-template/api.ts
- client-analytics-profitability-panel.tsx
- IbProgramSymbolsView
- ib-reward-logs/index.ts
- compilerOptions
- client-insurance/api.ts
- client-risk-metrics-view.tsx
- ib-plan/api.ts
- platform/api.ts
- site-header.tsx
- bonus-offer-template/api.ts
- trading-migrations-view.tsx
- BonusOffersView
- ib-earnings-content.tsx
- login-form.tsx
- initial-amount/api.ts
- configuration/api.ts
- client-analytics-dashboard-panel.tsx
- components.json
- client-contest/api.ts
- use-account-positions-channel.ts
- auth.ts
- ib-program/api.ts
- ib-plan-subscription-detail-dialog.tsx
- errors.ts
- ScheduledCommandsView
- forms-view.tsx
- devDependencies
- dependencies
- client-analytics-symbol-panel.tsx
- symbol-category/api.ts
- ib-admin-analytics/api.ts
- PlatformsView
- bonus-offers-view.tsx
- ib-plan-subscriptions-view.tsx
- BonusAssignmentLogsView
- position-history-view.tsx
- client-analytics-temporal-panel.tsx
- client-bonus/api.ts
- ib-admin-analytics/types.ts
- contest-general-form.tsx
- listServerGroupsForAdmin
- BonusExcludedInstrumentsView
- AccountInsurancesAdminView
- InsurancePlansView
- scheduled-commands-view.tsx
- ClientTradingAccountsView
- api-error-alert.tsx
- session.server.ts
- ib-subscription-form-dialog.tsx
- ContestBansDialog
- browser-client.ts
- app/layout.tsx
- leverage/api.ts
- skeleton.tsx
- ib-progression-templates-view.tsx
- session-constants.ts
- broker/[...path]/route.ts
- ContestAwardsView
- ContestConditionsView
- IbPlansView
- IB Admin Analytics
- bonus-offer-admin-assign-dialog.tsx
- RiskMetricsShareDialog
- use-trading-stream-positions-channel.ts
- package.json
- bonus-offer-templates-view.tsx
- config-form.ts
- app-area-bar.tsx
- NegativeBalanceRebalancesDataTable
- ib-programs-view.tsx
- IbPaymentTemplateFormDialog
- TradingSecuritiesView
- bonus-offer-form-dialog.tsx
- TradingServerGroupSecuritiesView
- client-positions-panel.tsx
- TradingSymbolsView
- scripts
- SymbolCategoriesView
- trading-account-positions-dialog.tsx
- README.md
- apply-position-snapshot.ts
- useIsMobile
- browserBrokerRequest
- createInsurancePlan
- platform-form-dialog.tsx
- class-variance-authority
- LeveragesView
- IbReferralsContent
- handleSubmit
- ContestGlobalSettingsView
- rejectAccountInsuranceClaim
- DialogFooter
- eslint.config.mjs
- laravel-echo
- next.config.ts
- pusher-js
- react-dom
- postcss.config.mjs
- syncInsurancePlanServerGroups
- react

## God Nodes (most connected - your core abstractions)
1. `formatBrokerApiError()` - 379 edges
2. `browserBrokerRequest()` - 279 edges
3. `cn()` - 234 edges
4. `ApiErrorAlert()` - 149 edges
5. `Button()` - 137 edges
6. `Skeleton()` - 98 edges
7. `Label()` - 88 edges
8. `Input()` - 82 edges
9. `DialogContent()` - 68 edges
10. `DialogHeader()` - 68 edges

## Surprising Connections (you probably didn't know these)
- `handle()` --calls--> `proxyBrokerRequest()`  [EXTRACTED]
  app/api/broker/[...path]/route.ts → lib/api/broker-client.ts
- `CardAction()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils.ts
- `DropdownMenuLabel()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts
- `SheetOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sheet.tsx → lib/utils.ts
- `handleSubscribe()` --calls--> `formatBrokerApiError()`  [EXTRACTED]
  features/client-ib/components/client-ib-plan-card.tsx → lib/api/errors.ts

## Import Cycles
- None detected.

## Communities (140 total, 16 thin omitted)

### Community 0 - "contest/api.ts"
Cohesion: 0.08
Nodes (56): buildServerGroupLabel(), createContestCondition(), deleteContest(), deleteContestAward(), deleteContestCondition(), getContestGlobalSettings(), invalidateContestFormCatalog(), listEligibleIntroducingBrokers() (+48 more)

### Community 1 - "broker-response.ts"
Cohesion: 0.09
Nodes (53): ActionTooltipButton(), ActionTooltipButtonProps, PageContentToolbar(), PageContentToolbarProps, Alert(), AlertDescription(), AlertTitle(), alertVariants (+45 more)

### Community 2 - "ib-program-payment-rule/api.ts"
Cohesion: 0.11
Nodes (30): createIbProgramCpaRule(), createIbProgramPnlRule(), createIbProgramVolumeRule(), ibProgramPath(), listIbProgramCpaRules(), listIbProgramPnlRules(), listIbProgramVolumeRules(), updateIbProgramCpaRule() (+22 more)

### Community 3 - "insurance/index.ts"
Cohesion: 0.14
Nodes (29): approveAccountInsuranceClaim(), createInsurancePlanOption(), deleteInsurancePlan(), deleteInsurancePlanOption(), getInsurancePlan(), updateInsurancePlan(), updateInsurancePlanOption(), handleSubmit() (+21 more)

### Community 4 - "cn"
Cohesion: 0.06
Nodes (53): AppSidebar(), bonusNavigation, contestsNavigation, ibNavigation, insuranceNavigation, reportsNavigation, systemNavigation, tradingNavigation (+45 more)

### Community 5 - "client-risk-metrics/api.ts"
Cohesion: 0.10
Nodes (38): analyticsOverviewInflight, analyticsOverviewRequestKey(), getAccountAnalyticsBehavior(), getAccountAnalyticsDaily(), getAccountAnalyticsDailyDayTrades(), getAccountAnalyticsDrawdowns(), getAccountAnalyticsDurationScatter(), getAccountAnalyticsEquityCurve() (+30 more)

### Community 6 - "TradingServerSecuritySymbolsView"
Cohesion: 0.22
Nodes (4): TradingServerSecuritySymbolsPageProps, formToAppliedFilters(), TradingServerSecuritySymbolsView(), applyFilters()

### Community 7 - "alert-dialog.tsx"
Cohesion: 0.13
Nodes (37): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogTitle() (+29 more)

### Community 8 - "scheduled-command-run-dialog.tsx"
Cohesion: 0.14
Nodes (31): buildListSearchParams(), cancelScheduledCommandRun(), listScheduledCommands(), runScheduledCommand(), updateScheduledCommand(), ScheduledCommandFormDialog(), handleSubmit(), ScheduledCommandRunDialog() (+23 more)

### Community 9 - "ib-plan-subscription/index.ts"
Cohesion: 0.14
Nodes (29): adminSubscriptionsPath(), createIbPlanSubscription(), getIbPlanSubscriptionFormSubmission(), listIbPlanSubscriptionAdminInteractions(), listIbPlanSubscriptions(), toSearchParams(), updateIbPlanSubscription(), updateIbPlanSubscriptionParameters() (+21 more)

### Community 10 - "client-trading-account/api.ts"
Cohesion: 0.14
Nodes (20): listClientServerGroupsForSelection(), loadClientAccountCatalog(), loadClientServerGroupEnvironments(), startTradingCredentialsChallenge(), toClientServerGroup(), updateClientTradingAccountCredentials(), ClientTradingAccountCredentialsDialog(), handleStartChallenge() (+12 more)

### Community 11 - "client-insurance/format.ts"
Cohesion: 0.13
Nodes (18): cancelClientAccountInsurance(), claimClientAccountInsurance(), contractClientAccountInsurance(), ClientInsuranceContractDialog(), handleSubmit(), loadPlans(), ClientInsurancesView(), handleCancel() (+10 more)

### Community 12 - "form-builder-view.tsx"
Cohesion: 0.14
Nodes (20): DashboardBreadcrumbsProps, Breadcrumb(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator(), BuilderTab (+12 more)

### Community 13 - "ib-admin-analytics-view.tsx"
Cohesion: 0.14
Nodes (21): AnalyticsKpis(), AnalyticsSeriesChart(), AnalyticsTab, availabilityReason(), CATEGORY_COLORS, CategoryDistribution(), ClientFunnel(), CommissionBySource() (+13 more)

### Community 14 - "trading-server/api.ts"
Cohesion: 0.10
Nodes (43): cachedEnvironmentsByAudience, configSchemasByPlatform, configSchemasDeniedPlatforms, createTradingServer(), deleteTradingServer(), getTradingServer(), listCatalogServerGroupLeverages(), listSecurities() (+35 more)

### Community 15 - "bonus-assignment-logs-view.tsx"
Cohesion: 0.13
Nodes (33): cancelBonusAssignment(), compactFilters(), listBonusAssignments(), listBonusNegativeBalanceCompensations(), listDepositBonusIntents(), breadcrumbs, ColumnSortHeadProps, logsTabs (+25 more)

### Community 16 - "client-contest-detail-view.tsx"
Cohesion: 0.07
Nodes (43): tabs, compactFilters(), getContestLeaderboardTop(), getContestSubscription(), getPublicContest(), listContestLeaderboard(), listPublicContestConditions(), listPublicContests() (+35 more)

### Community 17 - "ib-volume-reward-trades-report-view.tsx"
Cohesion: 0.04
Nodes (84): buildPageItems(), PageNumberPagination(), subscribeToHydration(), buildReportSearchParams(), exportIbVolumeRewardTrades(), getIbVolumeRewardTradeRewards(), listIbVolumeRewardTrades(), DEFAULT_FILTERS (+76 more)

### Community 18 - "client-ib/api.ts"
Cohesion: 0.11
Nodes (29): compactFilters(), getActiveIbPlanContext(), getMyIbPlanSubscription(), listClientIbPlans(), listMyIbPlanProgressionLogs(), subscribeToIbPlan(), withProxyClientPlan(), withProxyProgramImage() (+21 more)

### Community 19 - "forms-list-view.tsx"
Cohesion: 0.11
Nodes (26): archiveFormVersion(), cloneFormVersion(), createForm(), deleteForm(), getForm(), getFormVersion(), listForms(), builderPath() (+18 more)

### Community 20 - "formatBrokerApiError"
Cohesion: 0.05
Nodes (37): ContestAwardDeleteDialog(), handleDelete(), ContestConditionDeleteDialog(), handleDelete(), ContestDeleteDialog(), handleDelete(), IbPaymentTemplatesView(), summarizeLevels() (+29 more)

### Community 21 - "public-risk-metrics-view.tsx"
Cohesion: 0.08
Nodes (27): PublicRiskMetricsPageProps, getPublicRiskMetricsSummary(), applyLiveEquityChange(), applyRiskMetricChanges(), parseMetricJsonValue(), toUnixSecond(), toUtcDateKey(), onChange() (+19 more)

### Community 22 - "client-risk-metrics/types.ts"
Cohesion: 0.04
Nodes (46): AnalyticsCumulativePnl, AnalyticsDailyDayBehavior, AnalyticsDailyStats, AnalyticsDailyStreakSegment, AnalyticsDailyTradeRow, AnalyticsDailyTransitionMatrix, AnalyticsDashboard, AnalyticsDurationScatterPoint (+38 more)

### Community 23 - "form-document.ts"
Cohesion: 0.11
Nodes (32): FormBuilderPageProps, elementTitle(), FormBuilderView(), addElement(), changeDocument(), dropIntoContainer(), removeElement(), updateElement() (+24 more)

### Community 24 - "broker-client.ts"
Cohesion: 0.12
Nodes (24): buildIamUpstreamUrl(), DELETE, GET, handle(), PATCH, POST, PUT, RouteContext (+16 more)

### Community 25 - "ib-rewards-view.tsx"
Cohesion: 0.20
Nodes (19): listIbPrograms(), compactFilters(), listIbRewards(), breadcrumbs, IbRewardsView(), RewardParticipantCell(), truncateId(), formatDateTimeValue() (+11 more)

### Community 26 - "contest-workspace-panels.tsx"
Cohesion: 0.12
Nodes (28): assignContestAward(), assignContestCondition(), listAssignedContestAwards(), listAssignedContestConditions(), listContestAwards(), listContestBans(), listContestConditions(), listContestParticipants() (+20 more)

### Community 27 - "bonus-offer/api.ts"
Cohesion: 0.12
Nodes (36): adminAssignBonus(), deleteBonusOffer(), invalidateBonusOfferFormCatalog(), listBonusOffers(), listBonusOfferTemplates(), listEligibleAccountsForBonusOfferAdmin(), loadBonusOfferFormCatalog(), syncBonusExcludedInstruments() (+28 more)

### Community 28 - "server-group-edit-sheet.tsx"
Cohesion: 0.12
Nodes (31): toServerGroupOption(), toServerGroupOption(), updateServerGroup(), emptyCountryRow(), ServerGroupEditSheet(), handleSubmit(), ServerGroupEditSheetProps, handleSubmit() (+23 more)

### Community 29 - "IbPlanProgramsSyncView"
Cohesion: 0.10
Nodes (29): IbPlanProgramPivotFormDialog(), handleSubmit(), AvailableProgramItem(), handleDragStart(), formatProgressionMaxVolume(), IbPlanProgramsSyncView(), handleAssignedDrop(), handleDropOnAssigned() (+21 more)

### Community 30 - "risk-control/api.ts"
Cohesion: 0.15
Nodes (20): archiveRiskControlRule(), listRiskControlExecutions(), listRiskControlRules(), loadRiskControlCatalog(), prefix(), formatDate(), RiskControlView(), archiveSelected() (+12 more)

### Community 31 - "client-bonuses-view.tsx"
Cohesion: 0.15
Nodes (26): getClientBonusAssignment(), listAvailableBonusOffers(), ClientBonusAssignmentDetailDialog(), loadAssignment(), ClientBonusAssignmentDetailDialogProps, ClientBonusClaimDialog(), clientBonusesBreadcrumbs, ClientBonusesView() (+18 more)

### Community 32 - "rejection-templates-view.tsx"
Cohesion: 0.12
Nodes (27): compactFilters(), createRejectionTemplate(), deleteRejectionTemplate(), getRejectionTemplate(), listRejectionTemplates(), updateRejectionTemplate(), RejectionReasonComposer, RejectionReasonComposerHandle (+19 more)

### Community 33 - "trading-accounts-view.tsx"
Cohesion: 0.06
Nodes (48): TableFooter(), ListTradingAccountPositionsParams, listTradingAccounts(), resetTradingAccountCredentials(), ResetTradingAccountCredentialsInput, toSearchParams(), TradingAccountListMeta, TradingAccountListResponse (+40 more)

### Community 34 - "bonus-assignment-detail-dialog.tsx"
Cohesion: 0.23
Nodes (20): getBonusAssignment(), BonusAssignmentDetailDialog(), loadAssignment(), BonusAssignmentDetailDialogProps, abbreviateUuid(), AssignmentsTable(), DepositIntentsTable(), NegativeBalanceRebalancesTable() (+12 more)

### Community 35 - "client-analytics-behavior-panel.tsx"
Cohesion: 0.10
Nodes (24): buildCalendarGrid(), CalendarMonthView(), CalendarViewMode, CalendarYearView(), ClientAnalyticsBehaviorPanel(), load(), ClientAnalyticsBehaviorPanelProps, dailyKey() (+16 more)

### Community 36 - "button.tsx"
Cohesion: 0.12
Nodes (21): Button(), buttonVariants, Input(), ClientTradingAccountCredentialsDialogProps, emptyForm, FormState, IbPlanFormDialogProps, FormState (+13 more)

### Community 37 - "card.tsx"
Cohesion: 0.10
Nodes (30): ClientHomePage(), DashboardPage(), BrokerRequestCredentials(), Card(), CardAction(), CardContent(), CardDescription(), CardFooter() (+22 more)

### Community 38 - "ib-payment-template/api.ts"
Cohesion: 0.18
Nodes (20): createIbPaymentTemplate(), createIbPaymentTemplateLevel(), deleteIbPaymentTemplate(), deleteIbPaymentTemplateLevel(), listIbPaymentTemplates(), updateIbPaymentTemplateLevel(), IbPaymentTemplateDeleteDialog(), handleDelete() (+12 more)

### Community 39 - "client-analytics-profitability-panel.tsx"
Cohesion: 0.10
Nodes (20): AnalyticsPanelCard(), BreakEvenGauge(), buildProfitFactorSeries(), ClientAnalyticsProfitabilityPanel(), ClientAnalyticsProfitabilityPanelProps, CumulativeGranularity, DirectionBreakdown(), ExpectancyContributionBar() (+12 more)

### Community 40 - "IbProgramSymbolsView"
Cohesion: 0.12
Nodes (21): ibProgramPath(), listAllIbProgramSymbols(), listIbProgramSymbols(), syncIbProgramSymbols(), IbProgramSymbolConfigSheet(), IbProgramSymbolsView(), handleAddSymbol(), handleSave() (+13 more)

### Community 41 - "ib-reward-logs/index.ts"
Cohesion: 0.16
Nodes (17): compactFilters(), listIbRewardSettlementRuns(), listIbTradingAccountPeriodSnapshots(), IbRewardLogsView(), isRewardLogTab(), truncateId(), formatDateTimeValue(), formatMoneyValue() (+9 more)

### Community 42 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 43 - "client-insurance/api.ts"
Cohesion: 0.18
Nodes (18): compactFilters(), isInsuranceCandidateAccount(), listClientAccountInsurances(), listInsurancePlansForAccount(), loadAccountsWithInProgressInsurance(), loadClientInsuranceEligibleAccounts(), loadInsuranceEligibleAccountIds(), resolveEnvironmentByAccountId() (+10 more)

### Community 44 - "client-risk-metrics-view.tsx"
Cohesion: 0.09
Nodes (22): AccountMetricsPageProps, ANALYTICS_TABS, AnalyticsTab, applyAnalyticsUpdate(), applyDashboardMetrics(), applyPhaseMetricsUpdate(), ClientRiskMetricsView(), loadSymbolOptions() (+14 more)

### Community 45 - "ib-plan/api.ts"
Cohesion: 0.16
Nodes (26): appendIbPlanFormData(), createIbPlan(), deleteIbPlan(), listIbPlans(), mapIbPlanResponse(), mapIbPlansResponse(), seedIbDemoCatalog(), syncIbPlanPrograms() (+18 more)

### Community 46 - "platform/api.ts"
Cohesion: 0.18
Nodes (18): appendPlatformFormData(), createPlatform(), deletePlatform(), listAvailablePlatforms(), listConfiguredPlatforms(), listPlatforms(), mapPlatformResponse(), mapPlatformsResponse() (+10 more)

### Community 47 - "site-header.tsx"
Cohesion: 0.03
Nodes (16): Props, ClientContestDetailPageProps, IbPlanProgramsPageProps, IbPlanSubscriptionsPageProps, TradingServersPageProps, TradingSecuritiesPageProps, TradingServerGroupsPageProps, TradingSymbolsPageProps (+8 more)

### Community 48 - "bonus-offer-template/api.ts"
Cohesion: 0.15
Nodes (24): createBonusOfferTemplate(), deleteBonusOfferTemplate(), getBonusOfferTemplate(), listBonusOfferTemplates(), syncBonusOfferTemplateExcludedInstruments(), toSearchParams(), updateBonusOfferTemplate(), BonusOfferTemplateFormDialog() (+16 more)

### Community 49 - "trading-migrations-view.tsx"
Cohesion: 0.10
Nodes (21): getMigrationRun(), listMigrationAccounts(), listMigrationRuns(), PaginatedResponse, startTradingMigration(), breadcrumbs, formatDate(), labelForStatus() (+13 more)

### Community 50 - "BonusOffersView"
Cohesion: 0.11
Nodes (15): BonusOffersView(), clearFilters(), commitFilters(), onFilterEnter(), patchDraft(), toggleSort(), formatExpiresAt(), BonusOfferTemplatesView() (+7 more)

### Community 51 - "ib-earnings-content.tsx"
Cohesion: 0.14
Nodes (19): IbAnalyticsAudience, IbEarningsRequestFilters, EarningsCards(), EarningsControls, EarningsRow(), formatDate(), formatMoney(), IbEarningsContent() (+11 more)

### Community 52 - "login-form.tsx"
Cohesion: 0.15
Nodes (20): AdminLoginPage(), AdminLoginPageProps, ClientLoginPage(), ClientLoginPageProps, formAction(), LoginForm(), LoginFormProps, twoFaPrompt() (+12 more)

### Community 53 - "initial-amount/api.ts"
Cohesion: 0.11
Nodes (14): compactFilters(), listClientInitialAmounts(), listInitialAmounts(), syncInitialAmountServerGroups(), InitialAmountServerGroupsDialog(), handleSubmit(), InitialAmountsView(), applyFilters() (+6 more)

### Community 54 - "configuration/api.ts"
Cohesion: 0.17
Nodes (15): listConfigs(), updateConfigsBatch(), ConfigurationView(), handleSave(), CATEGORY_LABELS, categoryLabel(), displayValueForForm(), groupConfigsByCategory() (+7 more)

### Community 55 - "client-analytics-dashboard-panel.tsx"
Cohesion: 0.17
Nodes (18): AnalyticsDashboardSnapshot, ChartToggleChip(), ClientAnalyticsDashboardPanel(), ClientAnalyticsDashboardPanelProps, formatCurrency(), formatMetric(), formatNumber(), formatPercent() (+10 more)

### Community 56 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 57 - "client-contest/api.ts"
Cohesion: 0.16
Nodes (17): ClientContestsPage(), getContestBannerUrl(), getPublicContestGlobalSettings(), ClientContestHelpCard(), load(), ClientContestHelpCardProps, loadSettings(), ClientContestLeaderboardFilters (+9 more)

### Community 58 - "use-account-positions-channel.ts"
Cohesion: 0.16
Nodes (16): accountWatchPath(), heartbeatOpenPositionsWatch(), unwatchOpenPositions(), watchOpenPositions(), PositionsLiveStatus, useAccountPositionsChannel(), UseAccountPositionsChannelOptions, accountPositionsPrivateChannel() (+8 more)

### Community 59 - "auth.ts"
Cohesion: 0.19
Nodes (20): iamForwardHeaders(), LOGIN_PATH, loginAction(), logoutAction(), parseArea(), iamApiBase(), iamLogin(), iamLogout() (+12 more)

### Community 60 - "ib-program/api.ts"
Cohesion: 0.22
Nodes (14): appendIbProgramFormData(), createIbProgram(), deleteIbProgram(), mapIbProgramResponse(), mapIbProgramsResponse(), updateIbProgram(), withProxyImagePath(), IbProgramFormDialog() (+6 more)

### Community 61 - "ib-plan-subscription-detail-dialog.tsx"
Cohesion: 0.24
Nodes (9): adminLabel(), IbPlanSubscriptionAdminInteractionsDialog(), loadInteractions(), IbPlanSubscriptionDetailDialog(), IbPlanSubscriptionDetailDialogProps, formatDateTime(), subscriptionStatusLabel(), subscriptionStatusVariant() (+1 more)

### Community 62 - "errors.ts"
Cohesion: 0.09
Nodes (43): BrokerRequestCredentialsProps, CredentialValue(), Checkbox(), Dialog(), DialogContent(), DialogDescription(), DialogHeader(), DialogTitle() (+35 more)

### Community 63 - "ScheduledCommandsView"
Cohesion: 0.22
Nodes (4): getScheduledCommand(), formatDateTime(), ScheduledCommandsView(), openRunDialog()

### Community 64 - "forms-view.tsx"
Cohesion: 0.12
Nodes (23): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), publishFormVersion() (+15 more)

### Community 65 - "devDependencies"
Cohesion: 0.11
Nodes (19): babel-plugin-react-compiler, eslint, eslint-config-next, devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, tailwindcss (+11 more)

### Community 66 - "dependencies"
Cohesion: 0.11
Nodes (19): @base-ui/react, clsx, lightweight-charts, lucide-react, next, dependencies, @base-ui/react, clsx (+11 more)

### Community 67 - "client-analytics-symbol-panel.tsx"
Cohesion: 0.20
Nodes (15): ClientAnalyticsSymbolPanel(), load(), ClientAnalyticsSymbolPanelProps, formatNumber(), formatPercent(), formatSideLabel(), formatSymbolMetric(), MetricRow() (+7 more)

### Community 68 - "symbol-category/api.ts"
Cohesion: 0.30
Nodes (12): compactFilters(), createSymbolCategory(), deleteSymbolCategory(), listAllSymbolCategories(), listSymbolCategories(), updateSymbolCategory(), SymbolCategoryFormDialog(), handleSubmit() (+4 more)

### Community 69 - "ib-admin-analytics/api.ts"
Cohesion: 0.14
Nodes (21): earningsSearchParams(), getIbAnalytics(), getIbAnalyticsOverview(), getIbEarnings(), getIbEarningsDailyTrades(), getIbReferrals(), getIbReferralsGeo(), IbAnalyticsFilters (+13 more)

### Community 71 - "bonus-offers-view.tsx"
Cohesion: 0.12
Nodes (16): bonusOfferExcludedInstrumentsPath(), bonusOfferTemplateExcludedInstrumentsPath(), BonusOfferDeleteDialog(), handleDelete(), offerToForm(), toDateTimeLocalValue(), BonusOfferServerGroupsDialog(), handleSubmit() (+8 more)

### Community 72 - "ib-plan-subscriptions-view.tsx"
Cohesion: 0.06
Nodes (37): DropdownMenu(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuSeparator(), DropdownMenuTrigger(), listIbPlanPrograms(), IbPlanSubscriptionFormDialog() (+29 more)

### Community 73 - "BonusAssignmentLogsView"
Cohesion: 0.19
Nodes (13): assignmentFormToFilters(), BonusAssignmentLogsView(), clearFilters(), commitAssignmentFilters(), commitIntentFilters(), onAssignmentFilterEnter(), onIntentFilterEnter(), patchAssignmentDraft() (+5 more)

### Community 74 - "position-history-view.tsx"
Cohesion: 0.14
Nodes (14): PositionSide, listGlobalPositions(), listPositionCommissionRewards(), loadRewards(), DEFAULTS, FILTER_KEYS, fromSearch(), historyTab() (+6 more)

### Community 75 - "client-analytics-temporal-panel.tsx"
Cohesion: 0.18
Nodes (15): ClientAnalyticsTemporalPanel(), ClientAnalyticsTemporalPanelProps, DurationScatterPlot(), formatHours(), formatNumber(), formatPercent(), formatSignedCurrency(), heatCellColor() (+7 more)

### Community 76 - "client-bonus/api.ts"
Cohesion: 0.17
Nodes (13): claimBonusOffer(), compactFilters(), listClientBonusAssignments(), listEligibleAccountsForBonusOffer(), handleSubmit(), loadAccounts(), BonusAssignmentStatus, ClaimBonusOfferInput (+5 more)

### Community 77 - "ib-admin-analytics/types.ts"
Cohesion: 0.11
Nodes (18): IbAnalyticsAvailability, IbAnalyticsCountry, IbAnalyticsHistoricalRule, IbAnalyticsMetricGroup, IbAnalyticsMoney, IbAnalyticsMoneyAvailability, IbAnalyticsMoneyBreakdown, IbEarningsCards (+10 more)

### Community 78 - "contest-general-form.tsx"
Cohesion: 0.21
Nodes (15): createContest(), updateContest(), amountStep(), ContestGeneralForm(), handleSubmit(), ContestGeneralFormProps, contestToForm(), emptyForm (+7 more)

### Community 79 - "listServerGroupsForAdmin"
Cohesion: 0.09
Nodes (12): loadData(), getInitialAmount(), loadData(), loadData(), listServerGroupsForAdmin(), listTradingServersForAdmin(), formToAppliedFilters(), TradingServerGroupsView() (+4 more)

### Community 80 - "BonusExcludedInstrumentsView"
Cohesion: 0.27
Nodes (9): BonusExcludedInstrumentsView(), handleAddSymbol(), handleSave(), ExcludedInstrumentDraft, draftsSignature(), draftToSyncInput(), excludedInstrumentFromApi(), excludedInstrumentFromTradingSymbol() (+1 more)

### Community 81 - "AccountInsurancesAdminView"
Cohesion: 0.21
Nodes (14): AccountInsurancesAdminView(), applyFiltersFromDraft(), approveAccountInsuranceClaimEvent(), clearFilters(), commitFilters(), onFilterEnter(), patchDraft(), toggleSort() (+6 more)

### Community 82 - "InsurancePlansView"
Cohesion: 0.13
Nodes (7): compactFilters(), listAccountInsurancesAdmin(), listInsurancePlanOptions(), listInsurancePlans(), InsurancePlanOptionsDialog(), InsurancePlansView(), premiumModeLabel()

### Community 83 - "scheduled-commands-view.tsx"
Cohesion: 0.24
Nodes (11): ACTIVE_RUN_BLOCK_MESSAGE, hasActiveScheduledCommandRun(), formatDateTime(), runStatusVariant(), ScheduledCommandDetailDialog(), handleCancel(), ScheduledCommandDetailDialogProps, AutomaticFilter (+3 more)

### Community 84 - "ClientTradingAccountsView"
Cohesion: 0.11
Nodes (14): createClientTradingAccount(), ClientTradingAccountCreateDialog(), handleSubmit(), loadLeverages(), loadServerGroups(), ClientTradingAccountsView(), enrichAccounts(), formatLeverageLabel() (+6 more)

### Community 85 - "api-error-alert.tsx"
Cohesion: 0.11
Nodes (40): ApiErrorAlert(), ApiErrorAlertProps, PAGE_SIZE_OPTIONS, PageNumberPaginationProps, Label(), SelectContent(), SelectItem(), SelectTrigger() (+32 more)

### Community 86 - "session.server.ts"
Cohesion: 0.27
Nodes (13): iamRefresh(), decodeJwtPayload(), displayNameFromClaims(), sessionCookieName(), encryptSession(), sessionCookieMaxMs(), accessTokenStale(), BrokerAuthCredentials (+5 more)

### Community 87 - "ib-subscription-form-dialog.tsx"
Cohesion: 0.33
Nodes (7): getIbPlanSubscriptionForm(), fieldErrors(), findForm(), IbSubscriptionFormDialog(), handleSubmit(), inputNodes(), Props

### Community 88 - "ContestBansDialog"
Cohesion: 0.26
Nodes (12): revertContestBan(), abbreviateUuid(), ContestBansDialog(), applyFiltersFromDraft(), clearFilters(), commitFilters(), handleRevert(), onFilterEnter() (+4 more)

### Community 89 - "browser-client.ts"
Cohesion: 0.16
Nodes (14): BrowserBrokerRequestOptions, buildSearch(), serializeSearchParamValue(), BrokerApiError, browserIamRequest(), BrowserIamRequestOptions, BrokerErrorDetails, extractValidationMessages() (+6 more)

### Community 90 - "app/layout.tsx"
Cohesion: 0.33
Nodes (4): geistMono, geistSans, metadata, TooltipProvider()

### Community 91 - "leverage/api.ts"
Cohesion: 0.17
Nodes (17): compactFilters(), createLeverage(), deleteLeverage(), getLeverage(), LeverageAudience, listLeverages(), updateLeverage(), LeverageFormDialog() (+9 more)

### Community 92 - "skeleton.tsx"
Cohesion: 0.08
Nodes (50): TradingServerGroupSecuritiesPageProps, Badge(), badgeVariants, Skeleton(), Table(), TableBody(), TableCell(), TableHead() (+42 more)

### Community 93 - "ib-progression-templates-view.tsx"
Cohesion: 0.18
Nodes (15): createIbProgressionTemplate(), deleteIbProgressionTemplate(), listIbProgressionTemplates(), updateIbProgressionTemplate(), IbProgressionTemplatesView(), handleDelete(), TemplateForm(), handleSubmit() (+7 more)

### Community 94 - "session-constants.ts"
Cohesion: 0.23
Nodes (10): ADMIN_2FA_COOKIE, ADMIN_SESSION_COOKIE, CLIENT_2FA_COOKIE, CLIENT_SESSION_COOKIE, decryptSession(), parseSessionPayload(), SessionPayload, config (+2 more)

### Community 95 - "broker/[...path]/route.ts"
Cohesion: 0.25
Nodes (7): DELETE, GET, handle(), PATCH, POST, PUT, RouteContext

### Community 99 - "IB Admin Analytics"
Cohesion: 0.10
Nodes (16): Cumplimiento, Decisiones, Fase 1 — Overview, Necesidades posteriores, Fase 2 — Analytics, Comportamiento implementado, Contrato consumido, Fase 3 — Earnings (+8 more)

### Community 100 - "bonus-offer-admin-assign-dialog.tsx"
Cohesion: 0.26
Nodes (12): BonusOfferAdminAssignDialog(), handleAssign(), handleLoadAccounts(), handleOpenChange(), resetState(), BonusOfferAdminAssignDialogProps, formatAccountBalance(), formatMajorAmount() (+4 more)

### Community 101 - "RiskMetricsShareDialog"
Cohesion: 0.32
Nodes (8): createRiskMetricShare(), getAccountRiskMetricShare(), updateRiskMetricShare(), buildShareUrl(), RiskMetricsShareDialog(), handleCopyLink(), handleDisable(), handleEnable()

### Community 102 - "use-trading-stream-positions-channel.ts"
Cohesion: 0.17
Nodes (15): GatewayPosition, GatewayPositionsEvent, GatewaySubscriptionRejected, GatewayWelcomeFrame, isPositionsEvent(), isRecord(), isSubscriptionRejected(), isWelcomeFrame() (+7 more)

### Community 103 - "package.json"
Cohesion: 0.25
Nodes (7): name, pnpm, onlyBuiltDependencies, private, version, sharp, unrs-resolver

### Community 104 - "bonus-offer-templates-view.tsx"
Cohesion: 0.40
Nodes (4): bonusOfferTemplatesBreadcrumbs, ColumnSortHeadProps, formToAppliedFilters(), parseOptionalNumber()

### Community 105 - "config-form.ts"
Cohesion: 0.36
Nodes (8): TradingServerFormDialog(), handleSubmit(), loadOptions(), buildEmptyConfig(), configFromTradingServer(), getDefaultSchemaId(), MASKED_SECRET_VALUE, serializeConfigForSubmit()

### Community 106 - "app-area-bar.tsx"
Cohesion: 0.19
Nodes (9): AppAreaBar(), AppAreaBarProps, AreaSwitcher(), areaTabs, SidebarInset(), SidebarProvider(), APP_AREAS, AppAreaId (+1 more)

### Community 107 - "NegativeBalanceRebalancesDataTable"
Cohesion: 0.67
Nodes (3): NegativeBalanceRebalancesDataTable(), applyFilters(), onFilterEnter()

### Community 108 - "ib-programs-view.tsx"
Cohesion: 0.23
Nodes (5): ibProgramsBreadcrumbs, IbProgramsView(), settlementPeriodLabels, ibProgramPaymentRulesPath(), ibProgramSymbolsPath()

### Community 109 - "IbPaymentTemplateFormDialog"
Cohesion: 0.40
Nodes (4): createLevelDraft(), IbPaymentTemplateFormDialog(), addLevel(), handleSubmit()

### Community 111 - "bonus-offer-form-dialog.tsx"
Cohesion: 0.10
Nodes (28): createBonusOffer(), getBonusOffer(), listEligibleIntroducingBrokers(), syncBonusOfferIntroducingBrokers(), updateBonusOffer(), BONUS_OFFER_FIELD_HELP, BonusOfferFieldLabel(), BonusOfferFieldLabelProps (+20 more)

### Community 113 - "client-positions-panel.tsx"
Cohesion: 0.18
Nodes (16): accountHistoryPath(), accountPositionsPath(), closePosition(), listAccountPositions(), openPosition(), ClientPositionsPanelProps, PositionsFilter, OpenPositionDialog() (+8 more)

### Community 114 - "TradingSymbolsView"
Cohesion: 0.33
Nodes (3): formToAppliedFilters(), TradingSymbolsView(), applyFilters()

### Community 115 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 117 - "trading-account-positions-dialog.tsx"
Cohesion: 0.18
Nodes (12): ClientPositionsPanel(), handleClose(), formatNumber(), formatOpenedAt(), formatSide(), OpenPositionsSnapshotPayload, HistoryPositionsTable(), LivePositionsTable() (+4 more)

### Community 118 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 119 - "apply-position-snapshot.ts"
Cohesion: 0.70
Nodes (4): applyOpenPositionsSnapshot(), normalizeLivePosition(), toSide(), toSortableTime()

### Community 120 - "useIsMobile"
Cohesion: 0.70
Nodes (4): getIsMobileServerSnapshot(), getIsMobileSnapshot(), subscribeToMobileQuery(), useIsMobile()

### Community 121 - "browserBrokerRequest"
Cohesion: 0.09
Nodes (34): getContestRegistrationOptions(), listEligibleAccountsForContest(), subscribeToContest(), ClientContestSubscribeDialog(), handleSubmit(), loadAccounts(), hasValidRegistrationOptions(), activateContest() (+26 more)

### Community 122 - "createInsurancePlan"
Cohesion: 0.50
Nodes (4): createInsurancePlan(), InsurancePlanFormDialog(), handleSubmit(), planToForm()

### Community 123 - "platform-form-dialog.tsx"
Cohesion: 0.50
Nodes (3): emptyForm, FormState, PlatformFormDialogProps

### Community 127 - "IbReferralsContent"
Cohesion: 0.39
Nodes (8): getIbReferralAccounts(), AccountsDialog(), date(), flag(), GeoRanking(), IbReferralsContent(), money(), number()

### Community 128 - "handleSubmit"
Cohesion: 0.67
Nodes (3): handleSubmit(), successMessage(), toRequestBody()

### Community 130 - "ContestGlobalSettingsView"
Cohesion: 0.50
Nodes (4): ContestGlobalSettingsView(), handleSubmit(), settingsToForm(), parseOptionalInteger()

### Community 134 - "rejectAccountInsuranceClaim"
Cohesion: 0.67
Nodes (3): rejectAccountInsuranceClaim(), AccountInsuranceRejectDialog(), handleReject()

### Community 135 - "DialogFooter"
Cohesion: 0.15
Nodes (12): DialogFooter(), defaultLevels, IbPaymentTemplateFormDialogProps, emptyForm, FormState, getNextSortOrder(), IbPaymentTemplateLevelFormDialog(), IbPaymentTemplateLevelFormDialogProps (+4 more)

### Community 156 - "syncInsurancePlanServerGroups"
Cohesion: 0.50
Nodes (3): syncInsurancePlanServerGroups(), InsurancePlanServerGroupsDialog(), handleSubmit()

## Knowledge Gaps
- **578 isolated node(s):** `AdminLoginPageProps`, `ClientLoginPageProps`, `AccountMetricsPageProps`, `Props`, `ClientContestDetailPageProps` (+573 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatBrokerApiError()` connect `formatBrokerApiError` to `contest/api.ts`, `broker-response.ts`, `ib-program-payment-rule/api.ts`, `insurance/index.ts`, `client-risk-metrics/api.ts`, `TradingServerSecuritySymbolsView`, `alert-dialog.tsx`, `scheduled-command-run-dialog.tsx`, `client-trading-account/api.ts`, `client-insurance/format.ts`, `form-builder-view.tsx`, `ib-admin-analytics-view.tsx`, `bonus-assignment-logs-view.tsx`, `client-contest-detail-view.tsx`, `ib-volume-reward-trades-report-view.tsx`, `client-ib/api.ts`, `forms-list-view.tsx`, `public-risk-metrics-view.tsx`, `form-document.ts`, `ib-rewards-view.tsx`, `contest-workspace-panels.tsx`, `server-group-edit-sheet.tsx`, `IbPlanProgramsSyncView`, `risk-control/api.ts`, `client-bonuses-view.tsx`, `rejection-templates-view.tsx`, `trading-accounts-view.tsx`, `bonus-assignment-detail-dialog.tsx`, `client-analytics-behavior-panel.tsx`, `button.tsx`, `card.tsx`, `ib-payment-template/api.ts`, `client-analytics-profitability-panel.tsx`, `IbProgramSymbolsView`, `ib-reward-logs/index.ts`, `client-insurance/api.ts`, `ib-plan/api.ts`, `platform/api.ts`, `bonus-offer-template/api.ts`, `trading-migrations-view.tsx`, `BonusOffersView`, `ib-earnings-content.tsx`, `initial-amount/api.ts`, `configuration/api.ts`, `client-analytics-dashboard-panel.tsx`, `client-contest/api.ts`, `ib-program/api.ts`, `ib-plan-subscription-detail-dialog.tsx`, `errors.ts`, `ScheduledCommandsView`, `forms-view.tsx`, `client-analytics-symbol-panel.tsx`, `symbol-category/api.ts`, `ib-admin-analytics/api.ts`, `PlatformsView`, `bonus-offers-view.tsx`, `ib-plan-subscriptions-view.tsx`, `BonusAssignmentLogsView`, `position-history-view.tsx`, `client-analytics-temporal-panel.tsx`, `client-bonus/api.ts`, `contest-general-form.tsx`, `listServerGroupsForAdmin`, `BonusExcludedInstrumentsView`, `AccountInsurancesAdminView`, `InsurancePlansView`, `scheduled-commands-view.tsx`, `ClientTradingAccountsView`, `api-error-alert.tsx`, `ib-subscription-form-dialog.tsx`, `ContestBansDialog`, `browser-client.ts`, `leverage/api.ts`, `skeleton.tsx`, `ib-progression-templates-view.tsx`, `ContestAwardsView`, `ContestConditionsView`, `IbPlansView`, `bonus-offer-admin-assign-dialog.tsx`, `RiskMetricsShareDialog`, `bonus-offer-templates-view.tsx`, `config-form.ts`, `NegativeBalanceRebalancesDataTable`, `ib-programs-view.tsx`, `IbPaymentTemplateFormDialog`, `TradingSecuritiesView`, `bonus-offer-form-dialog.tsx`, `TradingServerGroupSecuritiesView`, `client-positions-panel.tsx`, `TradingSymbolsView`, `SymbolCategoriesView`, `trading-account-positions-dialog.tsx`, `browserBrokerRequest`, `createInsurancePlan`, `platform-form-dialog.tsx`, `LeveragesView`, `IbReferralsContent`, `handleSubmit`, `ContestGlobalSettingsView`, `rejectAccountInsuranceClaim`, `DialogFooter`, `syncInsurancePlanServerGroups`?**
  _High betweenness centrality (0.270) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `broker-response.ts`, `ContestGlobalSettingsView`, `ib-program-payment-rule/api.ts`, `client-risk-metrics/api.ts`, `alert-dialog.tsx`, `DialogFooter`, `scheduled-command-run-dialog.tsx`, `client-insurance/format.ts`, `form-builder-view.tsx`, `ib-admin-analytics-view.tsx`, `bonus-assignment-logs-view.tsx`, `client-contest-detail-view.tsx`, `ib-volume-reward-trades-report-view.tsx`, `client-ib/api.ts`, `forms-list-view.tsx`, `form-document.ts`, `ib-rewards-view.tsx`, `IbPlanProgramsSyncView`, `rejection-templates-view.tsx`, `trading-accounts-view.tsx`, `client-analytics-behavior-panel.tsx`, `button.tsx`, `card.tsx`, `client-analytics-profitability-panel.tsx`, `IbProgramSymbolsView`, `ib-reward-logs/index.ts`, `client-risk-metrics-view.tsx`, `site-header.tsx`, `trading-migrations-view.tsx`, `ib-earnings-content.tsx`, `client-analytics-dashboard-panel.tsx`, `ib-program/api.ts`, `errors.ts`, `ScheduledCommandsView`, `forms-view.tsx`, `client-analytics-symbol-panel.tsx`, `ib-admin-analytics/api.ts`, `ib-plan-subscriptions-view.tsx`, `BonusAssignmentLogsView`, `client-analytics-temporal-panel.tsx`, `BonusExcludedInstrumentsView`, `AccountInsurancesAdminView`, `scheduled-commands-view.tsx`, `api-error-alert.tsx`, `ContestBansDialog`, `skeleton.tsx`, `app-area-bar.tsx`, `ib-programs-view.tsx`, `createInsurancePlan`, `IbReferralsContent`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `browserBrokerRequest()` connect `browserBrokerRequest` to `contest/api.ts`, `ib-program-payment-rule/api.ts`, `insurance/index.ts`, `client-risk-metrics/api.ts`, `rejectAccountInsuranceClaim`, `alert-dialog.tsx`, `scheduled-command-run-dialog.tsx`, `ib-plan-subscription/index.ts`, `client-trading-account/api.ts`, `client-insurance/format.ts`, `trading-server/api.ts`, `bonus-assignment-logs-view.tsx`, `client-contest-detail-view.tsx`, `ib-volume-reward-trades-report-view.tsx`, `client-ib/api.ts`, `forms-list-view.tsx`, `formatBrokerApiError`, `public-risk-metrics-view.tsx`, `ib-rewards-view.tsx`, `contest-workspace-panels.tsx`, `bonus-offer/api.ts`, `syncInsurancePlanServerGroups`, `server-group-edit-sheet.tsx`, `risk-control/api.ts`, `client-bonuses-view.tsx`, `rejection-templates-view.tsx`, `trading-accounts-view.tsx`, `bonus-assignment-detail-dialog.tsx`, `card.tsx`, `ib-payment-template/api.ts`, `IbProgramSymbolsView`, `ib-reward-logs/index.ts`, `client-insurance/api.ts`, `ib-plan/api.ts`, `platform/api.ts`, `bonus-offer-template/api.ts`, `trading-migrations-view.tsx`, `initial-amount/api.ts`, `configuration/api.ts`, `client-contest/api.ts`, `use-account-positions-channel.ts`, `ib-program/api.ts`, `ScheduledCommandsView`, `forms-view.tsx`, `symbol-category/api.ts`, `ib-admin-analytics/api.ts`, `position-history-view.tsx`, `client-bonus/api.ts`, `contest-general-form.tsx`, `listServerGroupsForAdmin`, `InsurancePlansView`, `ClientTradingAccountsView`, `ib-subscription-form-dialog.tsx`, `ContestBansDialog`, `browser-client.ts`, `leverage/api.ts`, `ib-progression-templates-view.tsx`, `RiskMetricsShareDialog`, `bonus-offer-form-dialog.tsx`, `client-positions-panel.tsx`, `trading-account-positions-dialog.tsx`, `createInsurancePlan`, `IbReferralsContent`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **What connects `AdminLoginPageProps`, `ClientLoginPageProps`, `AccountMetricsPageProps` to the rest of the system?**
  _578 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `contest/api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0771478667445938 - nodes in this community are weakly interconnected._
- **Should `broker-response.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08646616541353383 - nodes in this community are weakly interconnected._
- **Should `ib-program-payment-rule/api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10510510510510511 - nodes in this community are weakly interconnected._