# Graph Report - mmt-broker-basic-ui  (2026-09-23)

## Corpus Check
- 453 files · ~189,167 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3281 nodes · 12155 edges · 151 communities (126 shown, 25 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b913a656`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- contest/api.ts
- broker-response.ts
- ib-program-payment-rules-view.tsx
- account-insurances-admin-view.tsx
- cn
- client-risk-metrics/api.ts
- trading-symbols-view.tsx
- alert-dialog.tsx
- scheduled-command-run-dialog.tsx
- ib-plan-subscription/index.ts
- client-trading-account/api.ts
- client-insurance/api.ts
- form-builder-view.tsx
- ib-admin-analytics-view.tsx
- trading-server/api.ts
- bonus-assignment-logs-view.tsx
- client-contest-detail-view.tsx
- positions-report-view.tsx
- client-ib-progression-panel.tsx
- FormsListView
- formatBrokerApiError
- public-risk-metrics-view.tsx
- client-risk-metrics/types.ts
- form-document.ts
- broker-client.ts
- ib-rewards-view.tsx
- contest-workspace-panels.tsx
- bonus-offer/api.ts
- trading-server/format.ts
- IbPlanProgramsSyncView
- risk-control/api.ts
- client-bonuses-view.tsx
- rejection-templates-view.tsx
- trading-account/api.ts
- bonus-assignment-detail-dialog.tsx
- client-analytics-behavior-panel.tsx
- button.tsx
- card.tsx
- ib-volume-reward-trades-report-view.tsx
- client-analytics-profitability-panel.tsx
- ib-program-symbols-view.tsx
- ib-reward-logs/index.ts
- compilerOptions
- ib-volume-reward-trades/types.ts
- client-risk-metrics-view.tsx
- ib-plan/api.ts
- platform/api.ts
- site-header.tsx
- bonus-offer-templates-view.tsx
- trading-migrations-view.tsx
- BonusOffersView
- ib-earnings-content.tsx
- login-form.tsx
- initial-amount/api.ts
- configuration/api.ts
- client-analytics-dashboard-panel.tsx
- components.json
- TradingAccountsView
- client-positions/api.ts
- auth.ts
- ib-program/api.ts
- subscriptionStatusLabel
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
- TradingServerGroupsView
- bonus-excluded-instruments-view.tsx
- ContestSubscriptionsView
- contest-workspace-view.tsx
- IbPlanSubscriptionsView
- ClientTradingAccountsView
- api-error-alert.tsx
- session.server.ts
- ib-subscription-form-dialog.tsx
- client-analytics-risk-drawdown-panel.tsx
- browser-client.ts
- tooltip.tsx
- leverage/api.ts
- skeleton.tsx
- ib-progression-template/api.ts
- session-constants.ts
- ib-partner-tier-panel.tsx
- ContestAwardsView
- ContestConditionsView
- IbPlansView
- IB Admin Analytics
- BonusOfferAdminAssignDialog
- RiskMetricsShareDialog
- TradingServersView
- package.json
- RejectionTemplatesView
- config-form.ts
- app-area-bar.tsx
- NegativeBalanceRebalancesDataTable
- ib-programs-view.tsx
- contest-subscriptions-view.tsx
- trading-accounts-view.tsx
- bonus-offer-form-dialog.tsx
- TradingServerGroupSecuritiesView
- ib-plan-programs-sync-view.tsx
- InitialAmountsView
- scripts
- trading-account-access-dialog.tsx
- ib-payment-template-level-form-dialog.tsx
- README.md
- insurance-plan-option-form-dialog.tsx
- useIsMobile
- browserBrokerRequest
- listServerGroupLeverages
- analytics/page.tsx
- class-variance-authority
- LeveragesView
- bonus-offer-admin-assign-dialog.tsx
- ib-referrals-content.tsx
- handleSubmit
- jwf-submission-readonly.tsx
- ContestGlobalSettingsView
- initial-amount-delete-dialog.tsx
- platform-delete-dialog.tsx
- ib-plan-subscription-form-dialog.tsx
- metrics/page.tsx
- ib-payment-templates-view.tsx
- accounts/[accountId]/risk-control/page.tsx
- eslint.config.mjs
- client/contests/[contestId]/page.tsx
- programs/page.tsx
- subscriptions/page.tsx
- laravel-echo
- next.config.ts
- pusher-js
- [tradingServerId]/securities/page.tsx
- react-dom
- postcss.config.mjs
- [securityId]/symbols/page.tsx
- server-groups/page.tsx
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
- `CardAction()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils.ts
- `DropdownMenuLabel()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts
- `handleSubscribe()` --calls--> `formatBrokerApiError()`  [EXTRACTED]
  features/client-ib/components/client-ib-plan-card.tsx → lib/api/errors.ts
- `getPublicRiskMetricsHistory()` --calls--> `browserBrokerRequest()`  [EXTRACTED]
  features/client-risk-metrics/api.ts → lib/api/browser-client.ts
- `getAccountRiskMetricsSummary()` --calls--> `browserBrokerRequest()`  [EXTRACTED]
  features/client-risk-metrics/api.ts → lib/api/browser-client.ts

## Import Cycles
- None detected.

## Communities (151 total, 25 thin omitted)

### Community 0 - "contest/api.ts"
Cohesion: 0.09
Nodes (49): buildServerGroupLabel(), createContestCondition(), deleteContest(), deleteContestAward(), deleteContestCondition(), invalidateContestFormCatalog(), listEligibleIntroducingBrokers(), loadContestFormCatalog() (+41 more)

### Community 1 - "broker-response.ts"
Cohesion: 0.12
Nodes (37): ActionTooltipButton(), ActionTooltipButtonProps, PageContentToolbar(), PageContentToolbarProps, Alert(), AlertDescription(), AlertTitle(), alertVariants (+29 more)

### Community 2 - "ib-program-payment-rules-view.tsx"
Cohesion: 0.06
Nodes (55): createIbPaymentTemplate(), createIbPaymentTemplateLevel(), deleteIbPaymentTemplate(), deleteIbPaymentTemplateLevel(), listIbPaymentTemplates(), updateIbPaymentTemplateLevel(), createLevelDraft(), IbPaymentTemplateFormDialog() (+47 more)

### Community 3 - "account-insurances-admin-view.tsx"
Cohesion: 0.06
Nodes (62): approveAccountInsuranceClaim(), compactFilters(), createInsurancePlan(), createInsurancePlanOption(), deleteInsurancePlan(), deleteInsurancePlanOption(), getInsurancePlan(), listAccountInsurancesAdmin() (+54 more)

### Community 4 - "cn"
Cohesion: 0.06
Nodes (54): AppSidebar(), bonusNavigation, contestsNavigation, ibNavigation, insuranceNavigation, reportsNavigation, systemNavigation, tradingNavigation (+46 more)

### Community 5 - "client-risk-metrics/api.ts"
Cohesion: 0.11
Nodes (30): analyticsOverviewInflight, analyticsOverviewRequestKey(), getAccountAnalyticsDaily(), getAccountAnalyticsDrawdowns(), getAccountAnalyticsDurationScatter(), getAccountAnalyticsEquityCurve(), getAccountAnalyticsOverview(), getAccountAnalyticsPnlDistribution() (+22 more)

### Community 6 - "trading-symbols-view.tsx"
Cohesion: 0.08
Nodes (18): loadLeverages(), getTradingServerForAdmin(), listCatalogServerGroupLeverages(), listSecurities(), listSecuritySymbols(), listSymbols(), toSearchParams(), formatDateTime() (+10 more)

### Community 7 - "alert-dialog.tsx"
Cohesion: 0.15
Nodes (32): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogTitle() (+24 more)

### Community 8 - "scheduled-command-run-dialog.tsx"
Cohesion: 0.13
Nodes (32): buildListSearchParams(), cancelScheduledCommandRun(), getScheduledCommand(), listScheduledCommands(), runScheduledCommand(), updateScheduledCommand(), ScheduledCommandFormDialog(), handleSubmit() (+24 more)

### Community 9 - "ib-plan-subscription/index.ts"
Cohesion: 0.15
Nodes (29): adminSubscriptionsPath(), createIbPlanSubscription(), getIbPlanSubscriptionFormSubmission(), listIbPlanSubscriptionAdminInteractions(), listIbPlanSubscriptions(), toSearchParams(), updateIbPlanSubscription(), updateIbPlanSubscriptionParameters() (+21 more)

### Community 10 - "client-trading-account/api.ts"
Cohesion: 0.15
Nodes (18): listClientServerGroupsForSelection(), loadClientAccountCatalog(), startTradingCredentialsChallenge(), toClientServerGroup(), updateClientTradingAccountCredentials(), ClientTradingAccountCredentialsDialog(), handleStartChallenge(), handleSubmit() (+10 more)

### Community 11 - "client-insurance/api.ts"
Cohesion: 0.08
Nodes (38): cancelClientAccountInsurance(), claimClientAccountInsurance(), compactFilters(), contractClientAccountInsurance(), isInsuranceCandidateAccount(), listClientAccountInsurances(), listInsurancePlansForAccount(), loadAccountsWithInProgressInsurance() (+30 more)

### Community 12 - "form-builder-view.tsx"
Cohesion: 0.14
Nodes (16): FormBuilderPageProps, DashboardBreadcrumbs(), DashboardBreadcrumbsProps, Breadcrumb(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage() (+8 more)

### Community 13 - "ib-admin-analytics-view.tsx"
Cohesion: 0.14
Nodes (21): AnalyticsKpis(), AnalyticsSeriesChart(), AnalyticsTab, availabilityReason(), CATEGORY_COLORS, CategoryDistribution(), ClientFunnel(), CommissionBySource() (+13 more)

### Community 14 - "trading-server/api.ts"
Cohesion: 0.11
Nodes (38): cachedEnvironmentsByAudience, configSchemasByPlatform, configSchemasDeniedPlatforms, createTradingServer(), deleteTradingServer(), getTradingServer(), listServerGroups(), listTradingServerConfigSchemas() (+30 more)

### Community 15 - "bonus-assignment-logs-view.tsx"
Cohesion: 0.13
Nodes (33): cancelBonusAssignment(), compactFilters(), listBonusAssignments(), listBonusNegativeBalanceCompensations(), listDepositBonusIntents(), breadcrumbs, ColumnSortHeadProps, logsTabs (+25 more)

### Community 16 - "client-contest-detail-view.tsx"
Cohesion: 0.10
Nodes (36): ClientContestsPage(), compactFilters(), getContestBannerUrl(), getContestLeaderboardTop(), getContestRegistrationOptions(), getContestSubscription(), getPublicContest(), listContestLeaderboard() (+28 more)

### Community 17 - "positions-report-view.tsx"
Cohesion: 0.09
Nodes (26): buildPageItems(), PageNumberPagination(), subscribeToHydration(), buildPositionsReportSearchParams(), exportPositionsReport(), getPositionReportDetail(), listPositionsReport(), activeCount() (+18 more)

### Community 18 - "client-ib-progression-panel.tsx"
Cohesion: 0.13
Nodes (26): compactFilters(), getActiveIbPlanContext(), getMyIbPlanSubscription(), listClientIbPlans(), listMyIbPlanProgressionLogs(), subscribeToIbPlan(), withProxyClientPlan(), withProxyProgramImage() (+18 more)

### Community 19 - "FormsListView"
Cohesion: 0.11
Nodes (18): cloneFormVersion(), deleteForm(), getFormVersion(), listForms(), builderPath(), editableVersion(), formatVersionDate(), FormsListView() (+10 more)

### Community 20 - "formatBrokerApiError"
Cohesion: 0.05
Nodes (42): ContestAwardDeleteDialog(), handleDelete(), ContestConditionDeleteDialog(), handleDelete(), ContestDeleteDialog(), handleDelete(), IbPaymentTemplateDeleteDialog(), handleDelete() (+34 more)

### Community 21 - "public-risk-metrics-view.tsx"
Cohesion: 0.08
Nodes (24): PublicRiskMetricsPageProps, getPublicRiskMetricsSummary(), applyLiveEquityChange(), applyRiskMetricChanges(), parseMetricJsonValue(), toUnixSecond(), toUtcDateKey(), PublicAnalyticsOverviewView() (+16 more)

### Community 22 - "client-risk-metrics/types.ts"
Cohesion: 0.05
Nodes (38): AnalyticsCumulativePnl, AnalyticsDailyDayBehavior, AnalyticsDailyStats, AnalyticsDailyStreakSegment, AnalyticsDailyTradeRow, AnalyticsDailyTransitionMatrix, AnalyticsDurationScatterPoint, AnalyticsEquityCurvePoint (+30 more)

### Community 23 - "form-document.ts"
Cohesion: 0.13
Nodes (31): elementTitle(), FormBuilderView(), addElement(), changeDocument(), dropIntoContainer(), removeElement(), updateElement(), isPaletteType() (+23 more)

### Community 24 - "broker-client.ts"
Cohesion: 0.09
Nodes (31): DELETE, GET, handle(), PATCH, POST, PUT, RouteContext, buildIamUpstreamUrl() (+23 more)

### Community 25 - "ib-rewards-view.tsx"
Cohesion: 0.17
Nodes (20): compactFilters(), listIbRewards(), breadcrumbs, IbRewardsView(), RewardParticipantCell(), truncateId(), formatDateTimeValue(), formatMoneyValue() (+12 more)

### Community 26 - "contest-workspace-panels.tsx"
Cohesion: 0.08
Nodes (40): assignContestAward(), assignContestCondition(), listAssignedContestAwards(), listAssignedContestConditions(), listContestAwards(), listContestBans(), listContestConditions(), revertContestBan() (+32 more)

### Community 27 - "bonus-offer/api.ts"
Cohesion: 0.12
Nodes (36): adminAssignBonus(), deleteBonusOffer(), invalidateBonusOfferFormCatalog(), listBonusOffers(), listBonusOfferTemplates(), listEligibleAccountsForBonusOfferAdmin(), listEligibleIntroducingBrokers(), loadBonusOfferFormCatalog() (+28 more)

### Community 28 - "trading-server/format.ts"
Cohesion: 0.08
Nodes (37): toServerGroupOption(), toServerGroupOption(), createClientTradingAccount(), ClientTradingAccountCreateDialog(), handleSubmit(), loadServerGroups(), enrichAccounts(), formatLeverageLabel() (+29 more)

### Community 29 - "IbPlanProgramsSyncView"
Cohesion: 0.14
Nodes (24): IbPlanProgramPivotFormDialog(), handleSubmit(), formatProgressionMaxVolume(), IbPlanProgramsSyncView(), handleAssignedDrop(), handleDropOnAssigned(), handleDropOnAssignedRow(), handleDropOnAvailable() (+16 more)

### Community 30 - "risk-control/api.ts"
Cohesion: 0.13
Nodes (21): Props, archiveRiskControlRule(), listRiskControlExecutions(), listRiskControlRules(), loadRiskControlCatalog(), prefix(), formatDate(), RiskControlView() (+13 more)

### Community 31 - "client-bonuses-view.tsx"
Cohesion: 0.16
Nodes (25): getClientBonusAssignment(), listAvailableBonusOffers(), ClientBonusAssignmentDetailDialog(), loadAssignment(), ClientBonusAssignmentDetailDialogProps, ClientBonusClaimDialog(), clientBonusesBreadcrumbs, ClientBonusesView() (+17 more)

### Community 32 - "rejection-templates-view.tsx"
Cohesion: 0.17
Nodes (23): compactFilters(), createRejectionTemplate(), deleteRejectionTemplate(), getRejectionTemplate(), listRejectionTemplates(), updateRejectionTemplate(), RejectionReasonComposerProps, RejectionTemplateDeleteDialog() (+15 more)

### Community 33 - "trading-account/api.ts"
Cohesion: 0.19
Nodes (18): ListTradingAccountPositionsParams, listTradingAccounts(), ResetTradingAccountCredentialsInput, toSearchParams(), TradingAccountListMeta, TradingAccountListResponse, EMPTY_TRADING_ACCOUNT_FILTERS, resolveAccountOwner() (+10 more)

### Community 34 - "bonus-assignment-detail-dialog.tsx"
Cohesion: 0.23
Nodes (20): getBonusAssignment(), BonusAssignmentDetailDialog(), loadAssignment(), BonusAssignmentDetailDialogProps, abbreviateUuid(), AssignmentsTable(), DepositIntentsTable(), NegativeBalanceRebalancesTable() (+12 more)

### Community 35 - "client-analytics-behavior-panel.tsx"
Cohesion: 0.10
Nodes (26): getAccountAnalyticsBehavior(), getAccountAnalyticsDailyDayTrades(), buildCalendarGrid(), CalendarMonthView(), CalendarViewMode, CalendarYearView(), ClientAnalyticsBehaviorPanel(), load() (+18 more)

### Community 36 - "button.tsx"
Cohesion: 0.09
Nodes (30): Button(), buttonVariants, DialogTitle(), Input(), ClientTradingAccountCreateDialogProps, SelectableCardProps, ClientTradingAccountCredentialsDialogProps, ColumnSortHeadProps (+22 more)

### Community 37 - "card.tsx"
Cohesion: 0.12
Nodes (27): BrokerRequestCredentials(), Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle() (+19 more)

### Community 38 - "ib-volume-reward-trades-report-view.tsx"
Cohesion: 0.13
Nodes (30): getIbVolumeRewardTradeRewards(), DEFAULT_FILTERS, EMPTY_DRAFT, FilterDraft, identity(), paymentTemplateLabel(), planProgramLabel(), serverGroup() (+22 more)

### Community 39 - "client-analytics-profitability-panel.tsx"
Cohesion: 0.11
Nodes (19): AnalyticsPanelCard(), BreakEvenGauge(), ClientAnalyticsProfitabilityPanel(), ClientAnalyticsProfitabilityPanelProps, CumulativeGranularity, DirectionBreakdown(), ExpectancyContributionBar(), formatCurrency() (+11 more)

### Community 40 - "ib-program-symbols-view.tsx"
Cohesion: 0.12
Nodes (23): ibProgramPath(), listAllIbProgramSymbols(), listIbProgramSymbols(), syncIbProgramSymbols(), IbProgramSymbolConfigSheet(), IbProgramSymbolsView(), handleAddSymbol(), handleSave() (+15 more)

### Community 41 - "ib-reward-logs/index.ts"
Cohesion: 0.16
Nodes (17): compactFilters(), listIbRewardSettlementRuns(), listIbTradingAccountPeriodSnapshots(), IbRewardLogsView(), isRewardLogTab(), truncateId(), formatDateTimeValue(), formatMoneyValue() (+9 more)

### Community 42 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 43 - "ib-volume-reward-trades/types.ts"
Cohesion: 0.09
Nodes (25): buildReportSearchParams(), exportIbVolumeRewardTrades(), listIbVolumeRewardTrades(), IbVolumeRewardTradesReportView(), applyFilters(), download(), timestamp(), CalculationAvailability (+17 more)

### Community 44 - "client-risk-metrics-view.tsx"
Cohesion: 0.10
Nodes (21): ANALYTICS_TABS, AnalyticsTab, applyAnalyticsUpdate(), applyDashboardMetrics(), applyPhaseMetricsUpdate(), ClientRiskMetricsView(), ClientRiskMetricsViewProps, DATE_RANGE_OPTIONS (+13 more)

### Community 45 - "ib-plan/api.ts"
Cohesion: 0.17
Nodes (26): appendIbPlanFormData(), createIbPlan(), deleteIbPlan(), listIbPlanPrograms(), listIbPlans(), mapIbPlanResponse(), mapIbPlansResponse(), seedIbDemoCatalog() (+18 more)

### Community 46 - "platform/api.ts"
Cohesion: 0.19
Nodes (17): appendPlatformFormData(), createPlatform(), listAvailablePlatforms(), listConfiguredPlatforms(), listPlatforms(), mapPlatformResponse(), mapPlatformsResponse(), updatePlatform() (+9 more)

### Community 47 - "site-header.tsx"
Cohesion: 0.05
Nodes (4): TradingSymbolsPageProps, SiteHeader(), SiteHeaderProps, ContestCreateView()

### Community 48 - "bonus-offer-templates-view.tsx"
Cohesion: 0.12
Nodes (33): createBonusOfferTemplate(), deleteBonusOfferTemplate(), getBonusOfferTemplate(), listBonusOfferTemplates(), syncBonusOfferTemplateExcludedInstruments(), toSearchParams(), updateBonusOfferTemplate(), BonusOfferTemplateDeleteDialog() (+25 more)

### Community 49 - "trading-migrations-view.tsx"
Cohesion: 0.11
Nodes (22): getMigrationRun(), listMigrationAccounts(), listMigrationRuns(), PaginatedResponse, startTradingMigration(), breadcrumbs, formatDate(), labelForStatus() (+14 more)

### Community 50 - "BonusOffersView"
Cohesion: 0.11
Nodes (15): BonusOffersView(), clearFilters(), commitFilters(), onFilterEnter(), patchDraft(), toggleSort(), formatExpiresAt(), BonusOfferTemplatesView() (+7 more)

### Community 51 - "ib-earnings-content.tsx"
Cohesion: 0.16
Nodes (17): EarningsCards(), EarningsControls, EarningsRow(), formatDate(), formatMoney(), IbEarningsContent(), IbEarningsContentProps, rateLabel() (+9 more)

### Community 52 - "login-form.tsx"
Cohesion: 0.14
Nodes (19): AdminLoginPage(), AdminLoginPageProps, ClientLoginPage(), ClientLoginPageProps, formAction(), LoginForm(), LoginFormProps, twoFaPrompt() (+11 more)

### Community 53 - "initial-amount/api.ts"
Cohesion: 0.18
Nodes (13): compactFilters(), getInitialAmount(), listClientInitialAmounts(), listInitialAmounts(), syncInitialAmountServerGroups(), InitialAmountServerGroupsDialog(), handleSubmit(), CreateInitialAmountInput (+5 more)

### Community 54 - "configuration/api.ts"
Cohesion: 0.17
Nodes (15): listConfigs(), updateConfigsBatch(), ConfigurationView(), handleSave(), CATEGORY_LABELS, categoryLabel(), displayValueForForm(), groupConfigsByCategory() (+7 more)

### Community 55 - "client-analytics-dashboard-panel.tsx"
Cohesion: 0.13
Nodes (22): AnalyticsDashboardSnapshot, ChartToggleChip(), ClientAnalyticsDashboardPanel(), ClientAnalyticsDashboardPanelProps, formatCurrency(), formatMetric(), formatNumber(), formatPercent() (+14 more)

### Community 56 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 57 - "TradingAccountsView"
Cohesion: 0.14
Nodes (15): abbreviateUuid(), formatMoney(), formToAppliedFilters(), parseOptionalNumber(), pnlClassName(), TradingAccountsView(), applyFiltersFromDraft(), changePage() (+7 more)

### Community 58 - "client-positions/api.ts"
Cohesion: 0.06
Nodes (46): accountHistoryPath(), accountPositionsPath(), accountWatchPath(), closePosition(), heartbeatOpenPositionsWatch(), listAccountPositions(), openPosition(), unwatchOpenPositions() (+38 more)

### Community 59 - "auth.ts"
Cohesion: 0.19
Nodes (21): iamForwardHeaders(), LOGIN_PATH, loginAction(), logoutAction(), parseArea(), iamApiBase(), iamLogin(), iamLogout() (+13 more)

### Community 60 - "ib-program/api.ts"
Cohesion: 0.20
Nodes (16): appendIbProgramFormData(), createIbProgram(), deleteIbProgram(), listIbPrograms(), mapIbProgramResponse(), mapIbProgramsResponse(), updateIbProgram(), withProxyImagePath() (+8 more)

### Community 61 - "subscriptionStatusLabel"
Cohesion: 0.18
Nodes (11): ClientIbPlanCard(), handleSubscribe(), clientIbPlanSubscriptionTypeLabel(), clientIbSubscriptionStatusLabel(), adminLabel(), IbPlanSubscriptionAdminInteractionsDialog(), loadInteractions(), IbPlanSubscriptionDetailDialog() (+3 more)

### Community 62 - "errors.ts"
Cohesion: 0.09
Nodes (38): BrokerRequestCredentialsProps, CredentialValue(), Checkbox(), Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader() (+30 more)

### Community 63 - "ScheduledCommandsView"
Cohesion: 0.15
Nodes (9): hasActiveScheduledCommandRun(), formatDateTime(), runStatusVariant(), ScheduledCommandDetailDialog(), handleCancel(), formatDateTime(), ScheduledCommandsView(), openRunDialog() (+1 more)

### Community 64 - "forms-view.tsx"
Cohesion: 0.09
Nodes (36): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetTitle(), archiveFormVersion(), createForm() (+28 more)

### Community 65 - "devDependencies"
Cohesion: 0.11
Nodes (19): babel-plugin-react-compiler, eslint, eslint-config-next, devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, tailwindcss (+11 more)

### Community 66 - "dependencies"
Cohesion: 0.11
Nodes (19): @base-ui/react, clsx, lightweight-charts, lucide-react, next, dependencies, @base-ui/react, clsx (+11 more)

### Community 67 - "client-analytics-symbol-panel.tsx"
Cohesion: 0.18
Nodes (17): getAccountAnalyticsSymbols(), ClientAnalyticsSymbolPanel(), load(), ClientAnalyticsSymbolPanelProps, formatNumber(), formatPercent(), formatSideLabel(), formatSymbolMetric() (+9 more)

### Community 68 - "symbol-category/api.ts"
Cohesion: 0.20
Nodes (13): compactFilters(), createSymbolCategory(), deleteSymbolCategory(), listAllSymbolCategories(), listSymbolCategories(), updateSymbolCategory(), SymbolCategoriesView(), SymbolCategoryFormDialog() (+5 more)

### Community 69 - "ib-admin-analytics/api.ts"
Cohesion: 0.16
Nodes (19): earningsSearchParams(), getIbAnalytics(), getIbAnalyticsOverview(), getIbEarnings(), getIbEarningsDailyTrades(), getIbReferrals(), getIbReferralsGeo(), IbAnalyticsOverviewFilters (+11 more)

### Community 71 - "bonus-offers-view.tsx"
Cohesion: 0.12
Nodes (15): bonusOfferExcludedInstrumentsPath(), bonusOfferTemplateExcludedInstrumentsPath(), BonusOfferDeleteDialog(), handleDelete(), BonusOfferIntroducingBrokersDialog(), handleSubmit(), loadData(), sortedIdsSignature() (+7 more)

### Community 72 - "ib-plan-subscriptions-view.tsx"
Cohesion: 0.10
Nodes (26): DropdownMenu(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuSeparator(), DropdownMenuTrigger(), IbPlanSubscriptionFormDialog(), handleSubmit() (+18 more)

### Community 73 - "BonusAssignmentLogsView"
Cohesion: 0.19
Nodes (13): assignmentFormToFilters(), BonusAssignmentLogsView(), clearFilters(), commitAssignmentFilters(), commitIntentFilters(), onAssignmentFilterEnter(), onIntentFilterEnter(), patchAssignmentDraft() (+5 more)

### Community 74 - "position-history-view.tsx"
Cohesion: 0.08
Nodes (31): applyOpenPositionsSnapshot(), normalizeLivePosition(), toSide(), toSortableTime(), ClientPositionsPanel(), ClientPositionsPanelProps, PositionsFilter, formatNumber() (+23 more)

### Community 75 - "client-analytics-temporal-panel.tsx"
Cohesion: 0.20
Nodes (14): ClientAnalyticsTemporalPanelProps, DurationScatterPlot(), formatHours(), formatNumber(), formatPercent(), formatSignedCurrency(), heatCellColor(), HourWeekdayHeatmap() (+6 more)

### Community 76 - "client-bonus/api.ts"
Cohesion: 0.17
Nodes (13): claimBonusOffer(), compactFilters(), listClientBonusAssignments(), listEligibleAccountsForBonusOffer(), handleSubmit(), loadAccounts(), BonusAssignmentStatus, ClaimBonusOfferInput (+5 more)

### Community 77 - "ib-admin-analytics/types.ts"
Cohesion: 0.12
Nodes (16): IbAnalyticsAvailability, IbAnalyticsCountry, IbAnalyticsHistoricalRule, IbAnalyticsMetricGroup, IbAnalyticsMoney, IbAnalyticsMoneyAvailability, IbAnalyticsMoneyBreakdown, IbEarningsCards (+8 more)

### Community 78 - "contest-general-form.tsx"
Cohesion: 0.17
Nodes (18): createContest(), updateContest(), amountStep(), ContestGeneralForm(), handleSubmit(), ContestGeneralFormProps, contestToForm(), emptyForm (+10 more)

### Community 79 - "TradingServerGroupsView"
Cohesion: 0.20
Nodes (4): formToAppliedFilters(), TradingServerGroupsView(), applyFilters(), formatBookTypeLabel()

### Community 80 - "bonus-excluded-instruments-view.tsx"
Cohesion: 0.15
Nodes (19): BonusExcludedInstrumentsView(), handleAddSymbol(), handleSave(), BonusExcludedInstrumentsViewProps, ExcludedInstrumentDraft, draftsSignature(), draftToSyncInput(), excludedInstrumentFromApi() (+11 more)

### Community 81 - "ContestSubscriptionsView"
Cohesion: 0.14
Nodes (17): listContestParticipants(), listContests(), storeContestBan(), toSearchParams(), ContestSubscriptionBanDialog(), handleBan(), abbreviateUuid(), ContestSubscriptionsView() (+9 more)

### Community 82 - "contest-workspace-view.tsx"
Cohesion: 0.20
Nodes (12): tabs, ClientContestsView(), getContest(), ContestWorkspaceTab, ContestWorkspaceView(), tabs, ContestsView(), CONTEST_WARNING_LABELS (+4 more)

### Community 83 - "IbPlanSubscriptionsView"
Cohesion: 0.15
Nodes (8): abbreviateUuid(), formToAppliedFilters(), IbPlanSubscriptionsView(), applyFiltersFromDraft(), clearFilters(), commitFilters(), onFilterEnter(), parseOptionalNumber()

### Community 84 - "ClientTradingAccountsView"
Cohesion: 0.14
Nodes (8): ClientTradingAccountsView(), loadEligibility(), formatAccountMoney(), formatEnvironmentLabel(), moneyFormatter, parseServerGroupDefaultAmount(), serverGroupNeedsInitialAmount(), TRADING_SERVER_ENVIRONMENT

### Community 85 - "api-error-alert.tsx"
Cohesion: 0.13
Nodes (33): ApiErrorAlert(), ApiErrorAlertProps, PAGE_SIZE_OPTIONS, PageNumberPaginationProps, Label(), SelectContent(), SelectItem(), SelectTrigger() (+25 more)

### Community 86 - "session.server.ts"
Cohesion: 0.19
Nodes (19): ClientHomePage(), DashboardPage(), iamRefresh(), decodeJwtPayload(), displayNameFromClaims(), jwtPayloadSegment(), sessionCookieName(), decryptSession() (+11 more)

### Community 87 - "ib-subscription-form-dialog.tsx"
Cohesion: 0.33
Nodes (7): getIbPlanSubscriptionForm(), fieldErrors(), findForm(), IbSubscriptionFormDialog(), handleSubmit(), inputNodes(), Props

### Community 88 - "client-analytics-risk-drawdown-panel.tsx"
Cohesion: 0.22
Nodes (13): ClientAnalyticsRiskDrawdownPanel(), ClientAnalyticsRiskDrawdownPanelProps, formatCurrency(), formatDays(), formatNumber(), formatPercent(), formatSignedCurrency(), MetricRow() (+5 more)

### Community 89 - "browser-client.ts"
Cohesion: 0.16
Nodes (14): BrowserBrokerRequestOptions, buildSearch(), serializeSearchParamValue(), BrokerApiError, browserIamRequest(), BrowserIamRequestOptions, BrokerErrorDetails, extractValidationMessages() (+6 more)

### Community 90 - "tooltip.tsx"
Cohesion: 0.19
Nodes (10): geistMono, geistSans, metadata, Tooltip(), TooltipContent(), TooltipProvider(), TooltipTrigger(), BONUS_OFFER_FIELD_HELP (+2 more)

### Community 91 - "leverage/api.ts"
Cohesion: 0.26
Nodes (13): compactFilters(), createLeverage(), deleteLeverage(), getLeverage(), LeverageAudience, listLeverages(), updateLeverage(), LeverageFormDialog() (+5 more)

### Community 92 - "skeleton.tsx"
Cohesion: 0.12
Nodes (38): Badge(), badgeVariants, Skeleton(), Table(), TableBody(), TableCell(), TableHead(), TableHeader() (+30 more)

### Community 93 - "ib-progression-template/api.ts"
Cohesion: 0.16
Nodes (13): createIbProgressionTemplate(), deleteIbProgressionTemplate(), updateIbProgressionTemplate(), IbProgressionTemplatesView(), handleDelete(), TemplateForm(), handleSubmit(), CreateIbProgressionTemplateInput (+5 more)

### Community 94 - "session-constants.ts"
Cohesion: 0.31
Nodes (7): ADMIN_2FA_COOKIE, ADMIN_SESSION_COOKIE, CLIENT_2FA_COOKIE, CLIENT_SESSION_COOKIE, config, hasValidSession(), middleware()

### Community 95 - "ib-partner-tier-panel.tsx"
Cohesion: 0.21
Nodes (11): IbAnalyticsViewProps, Tab, evaluationPeriod(), IbPartnerTierPanel(), number(), Props, rate(), getIbPartnerTier() (+3 more)

### Community 99 - "IB Admin Analytics"
Cohesion: 0.10
Nodes (16): Cumplimiento, Decisiones, Fase 1 — Overview, Necesidades posteriores, Fase 2 — Analytics, Comportamiento implementado, Contrato consumido, Fase 3 — Earnings (+8 more)

### Community 100 - "BonusOfferAdminAssignDialog"
Cohesion: 0.32
Nodes (8): BonusOfferAdminAssignDialog(), handleAssign(), handleLoadAccounts(), handleOpenChange(), resetState(), formatAccountBalance(), formatMajorAmount(), formatRewardSummary()

### Community 101 - "RiskMetricsShareDialog"
Cohesion: 0.32
Nodes (8): createRiskMetricShare(), getAccountRiskMetricShare(), updateRiskMetricShare(), buildShareUrl(), RiskMetricsShareDialog(), handleCopyLink(), handleDisable(), handleEnable()

### Community 103 - "package.json"
Cohesion: 0.25
Nodes (7): name, pnpm, onlyBuiltDependencies, private, version, sharp, unrs-resolver

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

### Community 109 - "contest-subscriptions-view.tsx"
Cohesion: 0.22
Nodes (6): ColumnSortHeadProps, ContestSubscriptionsViewProps, statusLabels, subscriptionsBreadcrumbs, CONTEST_STATUSES, ContestStatus

### Community 110 - "trading-accounts-view.tsx"
Cohesion: 0.25
Nodes (7): TableFooter(), TradingAccountNotesDialog(), ColumnSortHeadProps, moneyFormatter, PAGE_SIZE_OPTIONS, ServerGroupOption, tradingAccountsBreadcrumbs

### Community 111 - "bonus-offer-form-dialog.tsx"
Cohesion: 0.13
Nodes (24): createBonusOffer(), syncBonusOfferIntroducingBrokers(), updateBonusOffer(), BonusOfferFormDialog(), handleSubmit(), loadEligibleIbs(), loadFormData(), loadGroups() (+16 more)

### Community 112 - "TradingServerGroupSecuritiesView"
Cohesion: 0.22
Nodes (3): TradingServerGroupSecuritiesPageProps, formatDateTime(), TradingServerGroupSecuritiesView()

### Community 113 - "ib-plan-programs-sync-view.tsx"
Cohesion: 0.43
Nodes (6): AvailableProgramItem(), handleDragStart(), IbPlanProgramsSyncViewProps, encodePlanProgramDragPayload(), PLAN_PROGRAM_DRAG_MIME, PlanProgramDragPayload

### Community 115 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 116 - "trading-account-access-dialog.tsx"
Cohesion: 0.33
Nodes (6): updateTradingAccount(), ACTION_COPY, RESTRICTING_ACTIONS, TradingAccountAccessDialog(), handleConfirm(), TradingAccountAccessDialogProps

### Community 117 - "ib-payment-template-level-form-dialog.tsx"
Cohesion: 0.40
Nodes (5): emptyForm, FormState, getNextSortOrder(), IbPaymentTemplateLevelFormDialog(), IbPaymentTemplateLevelFormDialogProps

### Community 118 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 119 - "insurance-plan-option-form-dialog.tsx"
Cohesion: 0.40
Nodes (5): emptyForm, FormState, InsurancePlanOptionFormDialog(), InsurancePlanOptionFormDialogProps, optionToForm()

### Community 120 - "useIsMobile"
Cohesion: 0.70
Nodes (4): getIsMobileServerSnapshot(), getIsMobileSnapshot(), subscribeToMobileQuery(), useIsMobile()

### Community 121 - "browserBrokerRequest"
Cohesion: 0.13
Nodes (24): activateContest(), cancelContest(), createContestAward(), updateContestAward(), ContestAwardFormDialog(), handleSubmit(), ContestLifecycleDialog(), handleConfirm() (+16 more)

### Community 122 - "listServerGroupLeverages"
Cohesion: 0.33
Nodes (5): listServerGroupLeverages(), synchronizeServerGroupLeverages(), ServerGroupLeveragesSyncDialog(), handleSubmit(), loadLeverages()

### Community 126 - "bonus-offer-admin-assign-dialog.tsx"
Cohesion: 0.60
Nodes (4): BonusOfferAdminAssignDialogProps, formatMinorAmount(), formatUnmetRequirement(), getUnmetSummaries()

### Community 127 - "ib-referrals-content.tsx"
Cohesion: 0.20
Nodes (16): getIbReferralAccounts(), IbAnalyticsAudience, IbAnalyticsFilters, AccountsDialog(), ChildState, date(), flag(), GeoRanking() (+8 more)

### Community 128 - "handleSubmit"
Cohesion: 0.67
Nodes (3): handleSubmit(), successMessage(), toRequestBody()

### Community 129 - "jwf-submission-readonly.tsx"
Cohesion: 0.60
Nodes (4): displayValue(), findForm(), JwfSubmissionReadonly(), ReadonlyNode()

### Community 130 - "ContestGlobalSettingsView"
Cohesion: 0.29
Nodes (8): getContestGlobalSettings(), mapContestGlobalSettingsResponse(), updateContestGlobalSettings(), withProxyBannerUrl(), ContestGlobalSettingsView(), handleSubmit(), settingsToForm(), parseOptionalInteger()

### Community 131 - "initial-amount-delete-dialog.tsx"
Cohesion: 0.50
Nodes (4): deleteInitialAmount(), InitialAmountDeleteDialog(), handleDelete(), InitialAmountDeleteDialogProps

### Community 132 - "platform-delete-dialog.tsx"
Cohesion: 0.50
Nodes (4): deletePlatform(), PlatformDeleteDialog(), handleDelete(), PlatformDeleteDialogProps

### Community 133 - "ib-plan-subscription-form-dialog.tsx"
Cohesion: 0.50
Nodes (3): emptyForm, FormState, IbPlanSubscriptionFormDialogProps

### Community 135 - "ib-payment-templates-view.tsx"
Cohesion: 0.26
Nodes (5): IbPaymentTemplateLevelsDialog(), IbPaymentTemplateLevelsDialogProps, ibPaymentTemplatesBreadcrumbs, summarizeLevels(), formatPaymentTemplateRate()

## Knowledge Gaps
- **578 isolated node(s):** `AdminLoginPageProps`, `ClientLoginPageProps`, `AccountMetricsPageProps`, `Props`, `ClientContestDetailPageProps` (+573 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **25 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatBrokerApiError()` connect `formatBrokerApiError` to `contest/api.ts`, `broker-response.ts`, `ib-program-payment-rules-view.tsx`, `account-insurances-admin-view.tsx`, `client-risk-metrics/api.ts`, `trading-symbols-view.tsx`, `alert-dialog.tsx`, `scheduled-command-run-dialog.tsx`, `client-trading-account/api.ts`, `client-insurance/api.ts`, `form-builder-view.tsx`, `ib-admin-analytics-view.tsx`, `bonus-assignment-logs-view.tsx`, `client-contest-detail-view.tsx`, `positions-report-view.tsx`, `client-ib-progression-panel.tsx`, `FormsListView`, `public-risk-metrics-view.tsx`, `form-document.ts`, `ib-rewards-view.tsx`, `contest-workspace-panels.tsx`, `trading-server/format.ts`, `IbPlanProgramsSyncView`, `risk-control/api.ts`, `client-bonuses-view.tsx`, `rejection-templates-view.tsx`, `bonus-assignment-detail-dialog.tsx`, `client-analytics-behavior-panel.tsx`, `button.tsx`, `card.tsx`, `ib-volume-reward-trades-report-view.tsx`, `client-analytics-profitability-panel.tsx`, `ib-program-symbols-view.tsx`, `ib-reward-logs/index.ts`, `ib-volume-reward-trades/types.ts`, `ib-plan/api.ts`, `platform/api.ts`, `bonus-offer-templates-view.tsx`, `trading-migrations-view.tsx`, `BonusOffersView`, `ib-earnings-content.tsx`, `initial-amount/api.ts`, `configuration/api.ts`, `client-analytics-dashboard-panel.tsx`, `TradingAccountsView`, `client-positions/api.ts`, `ib-program/api.ts`, `subscriptionStatusLabel`, `errors.ts`, `ScheduledCommandsView`, `forms-view.tsx`, `client-analytics-symbol-panel.tsx`, `symbol-category/api.ts`, `ib-admin-analytics/api.ts`, `PlatformsView`, `bonus-offers-view.tsx`, `ib-plan-subscriptions-view.tsx`, `BonusAssignmentLogsView`, `position-history-view.tsx`, `client-analytics-temporal-panel.tsx`, `client-bonus/api.ts`, `contest-general-form.tsx`, `TradingServerGroupsView`, `bonus-excluded-instruments-view.tsx`, `ContestSubscriptionsView`, `contest-workspace-view.tsx`, `IbPlanSubscriptionsView`, `ClientTradingAccountsView`, `api-error-alert.tsx`, `ib-subscription-form-dialog.tsx`, `client-analytics-risk-drawdown-panel.tsx`, `browser-client.ts`, `leverage/api.ts`, `skeleton.tsx`, `ib-progression-template/api.ts`, `ib-partner-tier-panel.tsx`, `ContestAwardsView`, `ContestConditionsView`, `IbPlansView`, `BonusOfferAdminAssignDialog`, `RiskMetricsShareDialog`, `TradingServersView`, `RejectionTemplatesView`, `config-form.ts`, `NegativeBalanceRebalancesDataTable`, `ib-programs-view.tsx`, `contest-subscriptions-view.tsx`, `trading-accounts-view.tsx`, `bonus-offer-form-dialog.tsx`, `TradingServerGroupSecuritiesView`, `ib-plan-programs-sync-view.tsx`, `InitialAmountsView`, `trading-account-access-dialog.tsx`, `ib-payment-template-level-form-dialog.tsx`, `insurance-plan-option-form-dialog.tsx`, `browserBrokerRequest`, `listServerGroupLeverages`, `LeveragesView`, `bonus-offer-admin-assign-dialog.tsx`, `ib-referrals-content.tsx`, `handleSubmit`, `ContestGlobalSettingsView`, `initial-amount-delete-dialog.tsx`, `platform-delete-dialog.tsx`, `ib-plan-subscription-form-dialog.tsx`, `ib-payment-templates-view.tsx`?**
  _High betweenness centrality (0.248) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `broker-response.ts`, `ContestGlobalSettingsView`, `ib-program-payment-rules-view.tsx`, `account-insurances-admin-view.tsx`, `ib-plan-subscription-form-dialog.tsx`, `alert-dialog.tsx`, `scheduled-command-run-dialog.tsx`, `client-insurance/api.ts`, `form-builder-view.tsx`, `ib-admin-analytics-view.tsx`, `bonus-assignment-logs-view.tsx`, `positions-report-view.tsx`, `client-ib-progression-panel.tsx`, `FormsListView`, `form-document.ts`, `ib-rewards-view.tsx`, `contest-workspace-panels.tsx`, `IbPlanProgramsSyncView`, `rejection-templates-view.tsx`, `client-analytics-behavior-panel.tsx`, `button.tsx`, `card.tsx`, `ib-volume-reward-trades-report-view.tsx`, `client-analytics-profitability-panel.tsx`, `ib-program-symbols-view.tsx`, `ib-reward-logs/index.ts`, `ib-volume-reward-trades/types.ts`, `client-risk-metrics-view.tsx`, `trading-migrations-view.tsx`, `ib-earnings-content.tsx`, `client-analytics-dashboard-panel.tsx`, `TradingAccountsView`, `ib-program/api.ts`, `errors.ts`, `ScheduledCommandsView`, `forms-view.tsx`, `client-analytics-symbol-panel.tsx`, `ib-admin-analytics/api.ts`, `ib-plan-subscriptions-view.tsx`, `BonusAssignmentLogsView`, `client-analytics-temporal-panel.tsx`, `bonus-excluded-instruments-view.tsx`, `contest-workspace-view.tsx`, `api-error-alert.tsx`, `client-analytics-risk-drawdown-panel.tsx`, `tooltip.tsx`, `skeleton.tsx`, `app-area-bar.tsx`, `ib-programs-view.tsx`, `contest-subscriptions-view.tsx`, `trading-accounts-view.tsx`, `ib-plan-programs-sync-view.tsx`, `ib-referrals-content.tsx`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `browserBrokerRequest()` connect `browserBrokerRequest` to `contest/api.ts`, `ib-program-payment-rules-view.tsx`, `initial-amount-delete-dialog.tsx`, `account-insurances-admin-view.tsx`, `client-risk-metrics/api.ts`, `platform-delete-dialog.tsx`, `trading-symbols-view.tsx`, `scheduled-command-run-dialog.tsx`, `ib-plan-subscription/index.ts`, `client-trading-account/api.ts`, `client-insurance/api.ts`, `trading-server/api.ts`, `bonus-assignment-logs-view.tsx`, `client-contest-detail-view.tsx`, `positions-report-view.tsx`, `client-ib-progression-panel.tsx`, `FormsListView`, `formatBrokerApiError`, `public-risk-metrics-view.tsx`, `ib-rewards-view.tsx`, `contest-workspace-panels.tsx`, `bonus-offer/api.ts`, `trading-server/format.ts`, `risk-control/api.ts`, `client-bonuses-view.tsx`, `rejection-templates-view.tsx`, `trading-account/api.ts`, `bonus-assignment-detail-dialog.tsx`, `client-analytics-behavior-panel.tsx`, `ib-volume-reward-trades-report-view.tsx`, `ib-program-symbols-view.tsx`, `ib-reward-logs/index.ts`, `ib-volume-reward-trades/types.ts`, `ib-plan/api.ts`, `platform/api.ts`, `bonus-offer-templates-view.tsx`, `trading-migrations-view.tsx`, `initial-amount/api.ts`, `configuration/api.ts`, `client-positions/api.ts`, `ib-program/api.ts`, `forms-view.tsx`, `client-analytics-symbol-panel.tsx`, `symbol-category/api.ts`, `ib-admin-analytics/api.ts`, `position-history-view.tsx`, `client-bonus/api.ts`, `contest-general-form.tsx`, `bonus-excluded-instruments-view.tsx`, `ContestSubscriptionsView`, `contest-workspace-view.tsx`, `ib-subscription-form-dialog.tsx`, `browser-client.ts`, `leverage/api.ts`, `ib-progression-template/api.ts`, `ib-partner-tier-panel.tsx`, `RiskMetricsShareDialog`, `bonus-offer-form-dialog.tsx`, `trading-account-access-dialog.tsx`, `listServerGroupLeverages`, `ib-referrals-content.tsx`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **What connects `AdminLoginPageProps`, `ClientLoginPageProps`, `AccountMetricsPageProps` to the rest of the system?**
  _578 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `contest/api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0889894419306184 - nodes in this community are weakly interconnected._
- **Should `broker-response.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11973875181422351 - nodes in this community are weakly interconnected._
- **Should `ib-program-payment-rules-view.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06430745814307458 - nodes in this community are weakly interconnected._