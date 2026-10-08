# Graph Report - mmt-broker-basic-ui  (2026-10-08)

## Corpus Check
- 461 files · ~191,430 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3321 nodes · 12296 edges · 151 communities (134 shown, 17 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `070a787c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- contest/api.ts
- bonus-assignment-detail-dialog.tsx
- ib-program-payment-rules-view.tsx
- insurance/index.ts
- sidebar.tsx
- client-risk-metrics/api.ts
- trading-server-groups-view.tsx
- alert-dialog.tsx
- scheduled-command-run-dialog.tsx
- ib-plan-subscription/index.ts
- client-trading-account/api.ts
- client-insurances-view.tsx
- form-builder-view.tsx
- ib-admin-analytics-view.tsx
- trading-server/api.ts
- bonus-assignment-logs-view.tsx
- browserBrokerRequest
- finance-transactions-view.tsx
- client-ib/api.ts
- forms-view.tsx
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
- contest-subscription-ban-dialog.tsx
- trading-account/api.ts
- TradingAccountPositionsDialog
- client-analytics-behavior-panel.tsx
- cn
- card.tsx
- ib-volume-reward-trades-report-view.tsx
- client-analytics-profitability-panel.tsx
- IbProgramSymbolsView
- ib-reward-logs-view.tsx
- compilerOptions
- forms-list-view.tsx
- client-risk-metrics-view.tsx
- ib-plan/api.ts
- trading-accounts-view.tsx
- site-header.tsx
- bonus-offer-template/api.ts
- trading-migrations-view.tsx
- BonusAssignmentLogsView
- ib-earnings-content.tsx
- ib-volume-reward-trades/types.ts
- initial-amount/api.ts
- configuration-view.tsx
- client-analytics-dashboard-panel.tsx
- components.json
- BonusOffersView
- use-account-positions-channel.ts
- auth.ts
- ib-program/api.ts
- FormBuilderView
- dialog.tsx
- positions-report-view.tsx
- button.tsx
- devDependencies
- dependencies
- client-analytics-symbol-panel.tsx
- symbol-category/api.ts
- ib-admin-analytics/api.ts
- PlatformsView
- bonus-offers-view.tsx
- IbPlanSubscriptionsView
- client-positions-panel.tsx
- broker-response.ts
- use-trading-stream-positions-channel.ts
- client-bonus/api.ts
- ib-admin-analytics/types.ts
- contest-general-form.tsx
- TradingServerGroupsView
- listServerGroupsForAdmin
- contest-subscriptions-view.tsx
- contest-workspace-view.tsx
- errors.ts
- api-error-alert.tsx
- account-insurance-claim-dialogs.tsx
- session.server.ts
- ib-subscription-form-dialog.tsx
- client-analytics-risk-drawdown-panel.tsx
- browser-client.ts
- tooltip.tsx
- leverage/api.ts
- skeleton.tsx
- ib-progression-template/api.ts
- TradingAccountsView
- ib-partner-tier-panel.tsx
- ContestAwardsView
- ContestConditionsView
- IbPlansView
- IB Admin Analytics
- BonusOfferAdminAssignDialog
- RiskMetricsShareDialog
- BonusOfferTemplatesView
- package.json
- RejectionTemplatesView
- config-form.ts
- (portal)/layout.tsx
- ScheduledCommandsView
- IbProgramsView
- .fromResponse
- listEligibleIntroducingBrokers
- bonus-offer-form-dialog.tsx
- contest-bans-dialog.tsx
- trading-account-actions-menu.tsx
- initial-amount/format.ts
- scripts
- ib-analytics-view.tsx
- ib-payment-template-level-form-dialog.tsx
- README.md
- PositionHistoryView
- TradingServersView
- ib-analytics/api.ts
- listServerGroupLeverages
- ContestGlobalSettingsView
- class-variance-authority
- LeveragesView
- OpenPositionDialog
- ib-referrals-content.tsx
- handleSubmit
- NegativeBalanceRebalancesDataTable
- plan-programs-dnd.ts
- bonus-offer-admin-assign-dialog.tsx
- FormElementEditorSheet
- jwf-submission-readonly.tsx
- handleSubmit
- useIsMobile
- syncBonusOfferServerGroups
- eslint.config.mjs
- apply-position-snapshot.ts
- TradingAccountResetCredentialsDialog
- handleSave
- laravel-echo
- next.config.ts
- pusher-js
- ib-program-payment-rule/routes.ts
- insurance-plan-option-form-dialog.tsx
- postcss.config.mjs
- trading-account-access-dialog.tsx
- react-dom
- react

## God Nodes (most connected - your core abstractions)
1. `formatBrokerApiError()` - 384 edges
2. `browserBrokerRequest()` - 284 edges
3. `cn()` - 234 edges
4. `ApiErrorAlert()` - 150 edges
5. `Button()` - 139 edges
6. `Skeleton()` - 98 edges
7. `Label()` - 88 edges
8. `Input()` - 83 edges
9. `DialogContent()` - 69 edges
10. `DialogHeader()` - 69 edges

## Surprising Connections (you probably didn't know these)
- `DropdownMenuLabel()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts
- `SheetOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sheet.tsx → lib/utils.ts
- `SidebarInput()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sidebar.tsx → lib/utils.ts
- `SidebarFooter()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sidebar.tsx → lib/utils.ts
- `SidebarSeparator()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sidebar.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (151 total, 17 thin omitted)

### Community 0 - "contest/api.ts"
Cohesion: 0.09
Nodes (50): activateContest(), buildServerGroupLabel(), cancelContest(), createContestAward(), createContestCondition(), deleteContest(), deleteContestAward(), deleteContestCondition() (+42 more)

### Community 1 - "bonus-assignment-detail-dialog.tsx"
Cohesion: 0.24
Nodes (19): getBonusAssignment(), BonusAssignmentDetailDialog(), loadAssignment(), BonusAssignmentDetailDialogProps, abbreviateUuid(), AssignmentsTable(), DepositIntentsTable(), bonusAssignmentOfferLabel() (+11 more)

### Community 2 - "ib-program-payment-rules-view.tsx"
Cohesion: 0.06
Nodes (55): createIbPaymentTemplate(), createIbPaymentTemplateLevel(), deleteIbPaymentTemplate(), deleteIbPaymentTemplateLevel(), listIbPaymentTemplates(), updateIbPaymentTemplateLevel(), createLevelDraft(), IbPaymentTemplateFormDialog() (+47 more)

### Community 3 - "insurance/index.ts"
Cohesion: 0.06
Nodes (58): approveAccountInsuranceClaim(), compactFilters(), createInsurancePlan(), createInsurancePlanOption(), deleteInsurancePlan(), deleteInsurancePlanOption(), getInsurancePlan(), listAccountInsurancesAdmin() (+50 more)

### Community 4 - "sidebar.tsx"
Cohesion: 0.09
Nodes (33): bonusNavigation, contestsNavigation, ibNavigation, insuranceNavigation, reportsNavigation, systemNavigation, tradingNavigation, clientNavigation (+25 more)

### Community 5 - "client-risk-metrics/api.ts"
Cohesion: 0.10
Nodes (37): analyticsOverviewInflight, analyticsOverviewRequestKey(), getAccountAnalyticsBehavior(), getAccountAnalyticsDaily(), getAccountAnalyticsDailyDayTrades(), getAccountAnalyticsDrawdowns(), getAccountAnalyticsDurationScatter(), getAccountAnalyticsEquityCurve() (+29 more)

### Community 6 - "trading-server-groups-view.tsx"
Cohesion: 0.06
Nodes (43): TradingServerGroupSecuritiesPageProps, buildPageItems(), PageNumberPagination(), subscribeToHydration(), Alert(), AlertDescription(), AlertTitle(), alertVariants (+35 more)

### Community 7 - "alert-dialog.tsx"
Cohesion: 0.14
Nodes (34): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogTitle() (+26 more)

### Community 8 - "scheduled-command-run-dialog.tsx"
Cohesion: 0.14
Nodes (31): buildListSearchParams(), cancelScheduledCommandRun(), listScheduledCommands(), runScheduledCommand(), updateScheduledCommand(), ScheduledCommandFormDialog(), handleSubmit(), ScheduledCommandRunDialog() (+23 more)

### Community 9 - "ib-plan-subscription/index.ts"
Cohesion: 0.13
Nodes (32): adminSubscriptionsPath(), createIbPlanSubscription(), getIbPlanSubscriptionFormSubmission(), listIbPlanSubscriptionAdminInteractions(), listIbPlanSubscriptions(), toSearchParams(), updateIbPlanSubscription(), updateIbPlanSubscriptionParameters() (+24 more)

### Community 10 - "client-trading-account/api.ts"
Cohesion: 0.18
Nodes (15): listClientServerGroupsForSelection(), loadClientAccountCatalog(), toClientServerGroup(), loadServerGroups(), ClientAccountCatalog, ClientServerGroup, ClientTradingAccountListFilters, CreateClientTradingAccountInput (+7 more)

### Community 11 - "client-insurances-view.tsx"
Cohesion: 0.07
Nodes (46): cancelClientAccountInsurance(), claimClientAccountInsurance(), compactFilters(), contractClientAccountInsurance(), isInsuranceCandidateAccount(), listClientAccountInsurances(), listInsurancePlansForAccount(), loadAccountsWithInProgressInsurance() (+38 more)

### Community 12 - "form-builder-view.tsx"
Cohesion: 0.20
Nodes (14): BuilderTab, FormBuilderViewProps, InputPreview(), JwfFormPreview(), JwfFormPreviewProps, stringAttribute(), FORM_INPUT_TYPES, FormListFilters (+6 more)

### Community 13 - "ib-admin-analytics-view.tsx"
Cohesion: 0.14
Nodes (21): AnalyticsKpis(), AnalyticsSeriesChart(), AnalyticsTab, availabilityReason(), CATEGORY_COLORS, CategoryDistribution(), ClientFunnel(), CommissionBySource() (+13 more)

### Community 14 - "trading-server/api.ts"
Cohesion: 0.10
Nodes (44): cachedEnvironmentsByAudience, configSchemasByPlatform, configSchemasDeniedPlatforms, createTradingServer(), deleteTradingServer(), getTradingServer(), listCatalogServerGroupLeverages(), listCatalogServerGroups() (+36 more)

### Community 15 - "bonus-assignment-logs-view.tsx"
Cohesion: 0.12
Nodes (33): cancelBonusAssignment(), compactFilters(), listBonusAssignments(), listBonusNegativeBalanceCompensations(), listDepositBonusIntents(), breadcrumbs, ColumnSortHeadProps, logsTabs (+25 more)

### Community 16 - "browserBrokerRequest"
Cohesion: 0.11
Nodes (37): ClientContestsPage(), compactFilters(), getContestBannerUrl(), getContestLeaderboardTop(), getContestRegistrationOptions(), getContestSubscription(), getPublicContest(), listContestLeaderboard() (+29 more)

### Community 17 - "finance-transactions-view.tsx"
Cohesion: 0.26
Nodes (11): listFinanceTransactions(), showFinanceTransaction(), amountLabel(), dateLabel(), Detail(), FinanceTransactionsView(), labels, FinanceAccount (+3 more)

### Community 18 - "client-ib/api.ts"
Cohesion: 0.12
Nodes (27): compactFilters(), getActiveIbPlanContext(), getMyIbPlanSubscription(), listClientIbPlans(), listMyIbPlanProgressionLogs(), subscribeToIbPlan(), withProxyClientPlan(), withProxyProgramImage() (+19 more)

### Community 19 - "forms-view.tsx"
Cohesion: 0.14
Nodes (18): createForm(), getFormVersion(), listForms(), publishFormVersion(), saveFormDraft(), publish(), save(), addNode() (+10 more)

### Community 20 - "formatBrokerApiError"
Cohesion: 0.05
Nodes (44): BonusOfferDeleteDialog(), handleDelete(), ContestAwardDeleteDialog(), handleDelete(), ContestConditionDeleteDialog(), handleDelete(), ContestDeleteDialog(), handleDelete() (+36 more)

### Community 21 - "public-risk-metrics-view.tsx"
Cohesion: 0.07
Nodes (32): PublicRiskMetricsPageProps, getPublicRiskMetricsSummary(), applyLiveEquityChange(), applyRiskMetricChanges(), parseMetricJsonValue(), toUnixSecond(), toUtcDateKey(), PublicAnalyticsOverviewView() (+24 more)

### Community 22 - "client-risk-metrics/types.ts"
Cohesion: 0.04
Nodes (47): AnalyticsCumulativePnl, AnalyticsDailyDayBehavior, AnalyticsDailyStats, AnalyticsDailyStreakSegment, AnalyticsDailyTradeRow, AnalyticsDailyTransitionMatrix, AnalyticsDashboard, AnalyticsDurationScatterPoint (+39 more)

### Community 23 - "form-document.ts"
Cohesion: 0.17
Nodes (23): removeElement(), addFormElement(), collectInputNames(), containerPath(), containsNode(), editableForm(), findFormElement(), findNode() (+15 more)

### Community 24 - "broker-client.ts"
Cohesion: 0.10
Nodes (30): DELETE, GET, handle(), PATCH, POST, PUT, RouteContext, buildIamUpstreamUrl() (+22 more)

### Community 25 - "ib-rewards-view.tsx"
Cohesion: 0.19
Nodes (18): compactFilters(), listIbRewards(), breadcrumbs, IbRewardsView(), RewardParticipantCell(), truncateId(), formatDateTimeValue(), formatMoneyValue() (+10 more)

### Community 26 - "contest-workspace-panels.tsx"
Cohesion: 0.12
Nodes (28): assignContestAward(), assignContestCondition(), listAssignedContestAwards(), listAssignedContestConditions(), listContestAwards(), listContestBans(), listContestConditions(), unassignContestAward() (+20 more)

### Community 27 - "bonus-offer/api.ts"
Cohesion: 0.14
Nodes (32): adminAssignBonus(), deleteBonusOffer(), invalidateBonusOfferFormCatalog(), listBonusOfferTemplates(), listEligibleAccountsForBonusOfferAdmin(), loadBonusOfferFormCatalog(), AdminAssignBonusInput, AdminBonusAccountRequirement (+24 more)

### Community 28 - "trading-server/format.ts"
Cohesion: 0.09
Nodes (34): toServerGroupOption(), toServerGroupOption(), createClientTradingAccount(), ClientTradingAccountCreateDialog(), handleSubmit(), loadLeverages(), enrichAccounts(), formatLeverageLabel() (+26 more)

### Community 29 - "IbPlanProgramsSyncView"
Cohesion: 0.14
Nodes (24): IbPlanProgramPivotFormDialog(), handleSubmit(), formatProgressionMaxVolume(), IbPlanProgramsSyncView(), handleAssignedDrop(), handleDropOnAssigned(), handleDropOnAssignedRow(), handleDropOnAvailable() (+16 more)

### Community 30 - "risk-control/api.ts"
Cohesion: 0.15
Nodes (20): archiveRiskControlRule(), listRiskControlExecutions(), listRiskControlRules(), loadRiskControlCatalog(), prefix(), formatDate(), RiskControlView(), archiveSelected() (+12 more)

### Community 31 - "client-bonuses-view.tsx"
Cohesion: 0.16
Nodes (24): getClientBonusAssignment(), listAvailableBonusOffers(), ClientBonusAssignmentDetailDialog(), loadAssignment(), ClientBonusAssignmentDetailDialogProps, ClientBonusClaimDialog(), clientBonusesBreadcrumbs, ClientBonusesView() (+16 more)

### Community 32 - "contest-subscription-ban-dialog.tsx"
Cohesion: 0.16
Nodes (22): ContestSubscriptionBanDialogProps, compactFilters(), createRejectionTemplate(), deleteRejectionTemplate(), getRejectionTemplate(), listRejectionTemplates(), updateRejectionTemplate(), RejectionReasonComposer (+14 more)

### Community 33 - "trading-account/api.ts"
Cohesion: 0.17
Nodes (19): ListTradingAccountPositionsParams, listTradingAccounts(), resetTradingAccountCredentials(), ResetTradingAccountCredentialsInput, toSearchParams(), TradingAccountListMeta, TradingAccountListResponse, updateTradingAccount() (+11 more)

### Community 34 - "TradingAccountPositionsDialog"
Cohesion: 0.19
Nodes (9): AccountPositionsPageProps, ClientPositionsPanel(), formatNumber(), formatOpenedAt(), formatSide(), HistoryPositionsTable(), LivePositionsTable(), listTradingAccountPositions() (+1 more)

### Community 35 - "client-analytics-behavior-panel.tsx"
Cohesion: 0.10
Nodes (24): buildCalendarGrid(), CalendarMonthView(), CalendarViewMode, CalendarYearView(), ClientAnalyticsBehaviorPanel(), load(), ClientAnalyticsBehaviorPanelProps, dailyKey() (+16 more)

### Community 36 - "cn"
Cohesion: 0.08
Nodes (30): DashboardBreadcrumbs(), DashboardBreadcrumbsProps, AlertAction(), AlertDialogMedia(), AlertDialogOverlay(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem() (+22 more)

### Community 37 - "card.tsx"
Cohesion: 0.15
Nodes (18): BrokerRequestCredentials(), Card(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle(), getPublicContestGlobalSettings() (+10 more)

### Community 38 - "ib-volume-reward-trades-report-view.tsx"
Cohesion: 0.12
Nodes (32): getIbVolumeRewardTradeRewards(), DEFAULT_FILTERS, EMPTY_DRAFT, FilterDraft, identity(), paymentTemplateLabel(), planProgramLabel(), serverGroup() (+24 more)

### Community 39 - "client-analytics-profitability-panel.tsx"
Cohesion: 0.10
Nodes (20): AnalyticsPanelCard(), BreakEvenGauge(), buildProfitFactorSeries(), ClientAnalyticsProfitabilityPanel(), ClientAnalyticsProfitabilityPanelProps, CumulativeGranularity, DirectionBreakdown(), ExpectancyContributionBar() (+12 more)

### Community 40 - "IbProgramSymbolsView"
Cohesion: 0.12
Nodes (21): ibProgramPath(), listAllIbProgramSymbols(), listIbProgramSymbols(), syncIbProgramSymbols(), IbProgramSymbolConfigSheet(), IbProgramSymbolsView(), handleAddSymbol(), handleSave() (+13 more)

### Community 41 - "ib-reward-logs-view.tsx"
Cohesion: 0.16
Nodes (20): compactFilters(), listIbRewardSettlementRuns(), listIbTradingAccountPeriodSnapshots(), breadcrumbs, FailedFilter, IbRewardLogsView(), isRewardLogTab(), tabLabels (+12 more)

### Community 42 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 43 - "forms-list-view.tsx"
Cohesion: 0.19
Nodes (15): archiveFormVersion(), cloneFormVersion(), deleteForm(), builderPath(), editableVersion(), formatVersionDate(), FormsListView(), archive() (+7 more)

### Community 44 - "client-risk-metrics-view.tsx"
Cohesion: 0.08
Nodes (23): AccountMetricsPageProps, ANALYTICS_TABS, AnalyticsTab, applyAnalyticsUpdate(), applyDashboardMetrics(), applyPhaseMetricsUpdate(), ClientRiskMetricsView(), loadSymbolOptions() (+15 more)

### Community 45 - "ib-plan/api.ts"
Cohesion: 0.16
Nodes (26): appendIbPlanFormData(), createIbPlan(), deleteIbPlan(), listIbPlans(), mapIbPlanResponse(), mapIbPlansResponse(), seedIbDemoCatalog(), syncIbPlanPrograms() (+18 more)

### Community 46 - "trading-accounts-view.tsx"
Cohesion: 0.12
Nodes (25): TableFooter(), appendPlatformFormData(), createPlatform(), deletePlatform(), listAvailablePlatforms(), listConfiguredPlatforms(), listPlatforms(), mapPlatformResponse() (+17 more)

### Community 47 - "site-header.tsx"
Cohesion: 0.03
Nodes (12): Props, ClientContestDetailPageProps, IbPlanProgramsPageProps, IbPlanSubscriptionsPageProps, TradingServersPageProps, TradingSecuritiesPageProps, TradingServerSecuritySymbolsPageProps, TradingServerGroupsPageProps (+4 more)

### Community 48 - "bonus-offer-template/api.ts"
Cohesion: 0.15
Nodes (24): createBonusOfferTemplate(), deleteBonusOfferTemplate(), getBonusOfferTemplate(), listBonusOfferTemplates(), syncBonusOfferTemplateExcludedInstruments(), toSearchParams(), updateBonusOfferTemplate(), BonusOfferTemplateFormDialog() (+16 more)

### Community 49 - "trading-migrations-view.tsx"
Cohesion: 0.11
Nodes (22): getMigrationRun(), listMigrationAccounts(), listMigrationRuns(), PaginatedResponse, startTradingMigration(), breadcrumbs, formatDate(), labelForStatus() (+14 more)

### Community 50 - "BonusAssignmentLogsView"
Cohesion: 0.19
Nodes (13): assignmentFormToFilters(), BonusAssignmentLogsView(), clearFilters(), commitAssignmentFilters(), commitIntentFilters(), onAssignmentFilterEnter(), onIntentFilterEnter(), patchAssignmentDraft() (+5 more)

### Community 51 - "ib-earnings-content.tsx"
Cohesion: 0.16
Nodes (17): EarningsCards(), EarningsControls, EarningsRow(), formatDate(), formatMoney(), IbEarningsContent(), IbEarningsContentProps, rateLabel() (+9 more)

### Community 52 - "ib-volume-reward-trades/types.ts"
Cohesion: 0.09
Nodes (25): buildReportSearchParams(), exportIbVolumeRewardTrades(), listIbVolumeRewardTrades(), IbVolumeRewardTradesReportView(), applyFilters(), download(), timestamp(), CalculationAvailability (+17 more)

### Community 53 - "initial-amount/api.ts"
Cohesion: 0.18
Nodes (12): compactFilters(), getInitialAmount(), listInitialAmounts(), syncInitialAmountServerGroups(), InitialAmountServerGroupsDialog(), handleSubmit(), CreateInitialAmountInput, InitialAmount (+4 more)

### Community 54 - "configuration-view.tsx"
Cohesion: 0.11
Nodes (29): AppSidebar(), ClientAppSidebar(), listAllConfigs(), listConfigs(), updateConfigsBatch(), breadcrumbs, ConfigurationView(), handleSave() (+21 more)

### Community 55 - "client-analytics-dashboard-panel.tsx"
Cohesion: 0.14
Nodes (21): AnalyticsDashboardSnapshot, ChartToggleChip(), ClientAnalyticsDashboardPanel(), ClientAnalyticsDashboardPanelProps, formatCurrency(), formatMetric(), formatNumber(), formatPercent() (+13 more)

### Community 56 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 57 - "BonusOffersView"
Cohesion: 0.18
Nodes (8): BonusOffersView(), clearFilters(), commitFilters(), onFilterEnter(), patchDraft(), toggleSort(), formatExpiresAt(), sortBy()

### Community 58 - "use-account-positions-channel.ts"
Cohesion: 0.16
Nodes (16): accountWatchPath(), heartbeatOpenPositionsWatch(), unwatchOpenPositions(), watchOpenPositions(), PositionsLiveStatus, useAccountPositionsChannel(), UseAccountPositionsChannelOptions, accountPositionsPrivateChannel() (+8 more)

### Community 59 - "auth.ts"
Cohesion: 0.09
Nodes (42): iamForwardHeaders(), LOGIN_PATH, loginAction(), logoutAction(), parseArea(), AdminLoginPage(), AdminLoginPageProps, ClientLoginPage() (+34 more)

### Community 60 - "ib-program/api.ts"
Cohesion: 0.19
Nodes (17): appendIbProgramFormData(), createIbProgram(), deleteIbProgram(), listIbPrograms(), mapIbProgramResponse(), mapIbProgramsResponse(), updateIbProgram(), withProxyImagePath() (+9 more)

### Community 61 - "FormBuilderView"
Cohesion: 0.19
Nodes (10): FormBuilderPageProps, getForm(), elementTitle(), FormBuilderView(), addElement(), changeDocument(), dropIntoContainer(), updateElement() (+2 more)

### Community 62 - "dialog.tsx"
Cohesion: 0.09
Nodes (41): BrokerRequestCredentialsProps, CredentialValue(), Checkbox(), Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader() (+33 more)

### Community 63 - "positions-report-view.tsx"
Cohesion: 0.10
Nodes (23): buildPositionsReportSearchParams(), exportPositionsReport(), getPositionReportDetail(), listPositionsReport(), activeCount(), datetimeInput(), DEFAULT_FILTERS, fromSearch() (+15 more)

### Community 64 - "button.tsx"
Cohesion: 0.11
Nodes (27): Button(), buttonVariants, Input(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+19 more)

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
Cohesion: 0.20
Nodes (13): compactFilters(), createSymbolCategory(), deleteSymbolCategory(), listAllSymbolCategories(), listSymbolCategories(), updateSymbolCategory(), SymbolCategoriesView(), SymbolCategoryFormDialog() (+5 more)

### Community 69 - "ib-admin-analytics/api.ts"
Cohesion: 0.16
Nodes (19): earningsSearchParams(), getIbAnalytics(), getIbAnalyticsOverview(), getIbEarnings(), getIbEarningsDailyTrades(), getIbReferrals(), getIbReferralsGeo(), IbAnalyticsOverviewFilters (+11 more)

### Community 71 - "bonus-offers-view.tsx"
Cohesion: 0.16
Nodes (11): bonusOfferExcludedInstrumentsPath(), bonusOfferTemplateExcludedInstrumentsPath(), bonusOffersBreadcrumbs, bonusOfferTypeLabels, ColumnSortHeadProps, formToAppliedFilters(), parseOptionalNumber(), bonusOfferTemplatesBreadcrumbs (+3 more)

### Community 72 - "IbPlanSubscriptionsView"
Cohesion: 0.15
Nodes (8): abbreviateUuid(), formToAppliedFilters(), IbPlanSubscriptionsView(), applyFiltersFromDraft(), clearFilters(), commitFilters(), onFilterEnter(), parseOptionalNumber()

### Community 73 - "client-positions-panel.tsx"
Cohesion: 0.19
Nodes (15): accountHistoryPath(), accountPositionsPath(), closePosition(), listAccountPositions(), openPosition(), handleClose(), ClientPositionsPanelProps, emptyStateByFilter (+7 more)

### Community 74 - "broker-response.ts"
Cohesion: 0.13
Nodes (18): OpenPositionsSnapshotPayload, PositionSide, listPositionCommissionRewards(), formatAmount(), PositionCommissionRewardsDialog(), loadRewards(), PositionCommissionRewardsDialogProps, DEFAULTS (+10 more)

### Community 75 - "use-trading-stream-positions-channel.ts"
Cohesion: 0.19
Nodes (14): GatewayPosition, GatewayPositionsEvent, GatewaySubscriptionRejected, GatewayWelcomeFrame, isPositionsEvent(), isRecord(), isSubscriptionRejected(), isWelcomeFrame() (+6 more)

### Community 76 - "client-bonus/api.ts"
Cohesion: 0.16
Nodes (14): BonusAssignment, claimBonusOffer(), compactFilters(), listClientBonusAssignments(), listEligibleAccountsForBonusOffer(), handleSubmit(), loadAccounts(), BonusAssignmentStatus (+6 more)

### Community 77 - "ib-admin-analytics/types.ts"
Cohesion: 0.12
Nodes (16): IbAnalyticsAvailability, IbAnalyticsCountry, IbAnalyticsHistoricalRule, IbAnalyticsMetricGroup, IbAnalyticsMoney, IbAnalyticsMoneyAvailability, IbAnalyticsMoneyBreakdown, IbEarningsCards (+8 more)

### Community 78 - "contest-general-form.tsx"
Cohesion: 0.18
Nodes (16): createContest(), updateContest(), amountStep(), ContestGeneralForm(), handleSubmit(), ContestGeneralFormProps, contestToForm(), emptyForm (+8 more)

### Community 79 - "TradingServerGroupsView"
Cohesion: 0.20
Nodes (4): formToAppliedFilters(), TradingServerGroupsView(), applyFilters(), formatBookTypeLabel()

### Community 80 - "listServerGroupsForAdmin"
Cohesion: 0.22
Nodes (12): BonusExcludedInstrumentsView(), handleAddSymbol(), ExcludedInstrumentDraft, draftsSignature(), excludedInstrumentFromApi(), excludedInstrumentFromTradingSymbol(), excludedInstrumentKey(), loadData() (+4 more)

### Community 81 - "contest-subscriptions-view.tsx"
Cohesion: 0.11
Nodes (25): listContestParticipants(), listContests(), storeContestBan(), toSearchParams(), ContestSubscriptionBanDialog(), handleBan(), abbreviateUuid(), ColumnSortHeadProps (+17 more)

### Community 82 - "contest-workspace-view.tsx"
Cohesion: 0.20
Nodes (12): tabs, ClientContestsView(), getContest(), ContestWorkspaceTab, ContestWorkspaceView(), tabs, ContestsView(), CONTEST_WARNING_LABELS (+4 more)

### Community 83 - "errors.ts"
Cohesion: 0.13
Nodes (31): PAGE_SIZE_OPTIONS, PageNumberPaginationProps, Label(), SelectContent(), SelectItem(), SelectTrigger(), SelectValue(), ClientBonusClaimDialogProps (+23 more)

### Community 84 - "api-error-alert.tsx"
Cohesion: 0.10
Nodes (28): ApiErrorAlert(), ApiErrorAlertProps, listIbPlanPrograms(), ACTION_LABELS, adminLabel(), IbPlanSubscriptionAdminInteractionsDialog(), IbPlanSubscriptionAdminInteractionsDialogProps, IbPlanSubscriptionDetailDialog() (+20 more)

### Community 85 - "account-insurance-claim-dialogs.tsx"
Cohesion: 0.29
Nodes (6): AccountInsuranceApproveDialog(), handleApprove(), AccountInsuranceApproveDialogProps, AccountInsuranceRejectDialog(), handleReject(), AccountInsuranceRejectDialogProps

### Community 86 - "session.server.ts"
Cohesion: 0.12
Nodes (25): ClientHomePage(), DashboardPage(), decodeJwtPayload(), displayNameFromClaims(), jwtPayloadSegment(), ADMIN_2FA_COOKIE, ADMIN_SESSION_COOKIE, CLIENT_2FA_COOKIE (+17 more)

### Community 87 - "ib-subscription-form-dialog.tsx"
Cohesion: 0.33
Nodes (7): getIbPlanSubscriptionForm(), fieldErrors(), findForm(), IbSubscriptionFormDialog(), handleSubmit(), inputNodes(), Props

### Community 88 - "client-analytics-risk-drawdown-panel.tsx"
Cohesion: 0.20
Nodes (14): ClientAnalyticsRiskDrawdownPanel(), ClientAnalyticsRiskDrawdownPanelProps, formatCurrency(), formatDays(), formatNumber(), formatPercent(), formatSignedCurrency(), MetricRow() (+6 more)

### Community 89 - "browser-client.ts"
Cohesion: 0.25
Nodes (8): BrowserBrokerRequestOptions, buildSearch(), serializeSearchParamValue(), BrokerApiError, BrowserIamRequestOptions, BrokerErrorDetails, BrokerSuccessResponse, isBrokerSuccessResponse()

### Community 90 - "tooltip.tsx"
Cohesion: 0.23
Nodes (8): geistMono, geistSans, metadata, Tooltip(), TooltipContent(), TooltipProvider(), TooltipTrigger(), BonusOfferFieldLabelProps

### Community 91 - "leverage/api.ts"
Cohesion: 0.26
Nodes (13): compactFilters(), createLeverage(), deleteLeverage(), getLeverage(), LeverageAudience, listLeverages(), updateLeverage(), LeverageFormDialog() (+5 more)

### Community 92 - "skeleton.tsx"
Cohesion: 0.10
Nodes (57): ActionTooltipButton(), ActionTooltipButtonProps, PageContentToolbar(), PageContentToolbarProps, Badge(), badgeVariants, Skeleton(), Table() (+49 more)

### Community 93 - "ib-progression-template/api.ts"
Cohesion: 0.15
Nodes (14): createIbProgressionTemplate(), deleteIbProgressionTemplate(), listIbProgressionTemplates(), updateIbProgressionTemplate(), IbProgressionTemplatesView(), handleDelete(), TemplateForm(), handleSubmit() (+6 more)

### Community 94 - "TradingAccountsView"
Cohesion: 0.14
Nodes (15): abbreviateUuid(), formatMoney(), formToAppliedFilters(), parseOptionalNumber(), pnlClassName(), TradingAccountsView(), applyFiltersFromDraft(), changePage() (+7 more)

### Community 95 - "ib-partner-tier-panel.tsx"
Cohesion: 0.27
Nodes (9): evaluationPeriod(), IbPartnerTierPanel(), number(), Props, rate(), getIbPartnerTier(), IbPartnerTier, IbPartnerTierPaymentSymbol (+1 more)

### Community 99 - "IB Admin Analytics"
Cohesion: 0.10
Nodes (16): Cumplimiento, Decisiones, Fase 1 — Overview, Necesidades posteriores, Fase 2 — Analytics, Comportamiento implementado, Contrato consumido, Fase 3 — Earnings (+8 more)

### Community 100 - "BonusOfferAdminAssignDialog"
Cohesion: 0.32
Nodes (8): BonusOfferAdminAssignDialog(), handleAssign(), handleLoadAccounts(), handleOpenChange(), resetState(), formatAccountBalance(), formatMajorAmount(), formatRewardSummary()

### Community 101 - "RiskMetricsShareDialog"
Cohesion: 0.32
Nodes (8): createRiskMetricShare(), getAccountRiskMetricShare(), updateRiskMetricShare(), buildShareUrl(), RiskMetricsShareDialog(), handleCopyLink(), handleDisable(), handleEnable()

### Community 102 - "BonusOfferTemplatesView"
Cohesion: 0.29
Nodes (7): BonusOfferTemplatesView(), clearFilters(), commitFilters(), handleMutationSuccess(), onFilterEnter(), patchDraft(), toggleSort()

### Community 103 - "package.json"
Cohesion: 0.25
Nodes (7): name, pnpm, onlyBuiltDependencies, private, version, sharp, unrs-resolver

### Community 105 - "config-form.ts"
Cohesion: 0.36
Nodes (8): TradingServerFormDialog(), handleSubmit(), loadOptions(), buildEmptyConfig(), configFromTradingServer(), getDefaultSchemaId(), MASKED_SECRET_VALUE, serializeConfigForSubmit()

### Community 106 - "(portal)/layout.tsx"
Cohesion: 0.18
Nodes (10): AppAreaBar(), AppAreaBarProps, AreaSwitcher(), areaTabs, SidebarInset(), SidebarProvider(), FeatureAvailabilityProvider(), APP_AREAS (+2 more)

### Community 107 - "ScheduledCommandsView"
Cohesion: 0.15
Nodes (8): getScheduledCommand(), formatDateTime(), runStatusVariant(), ScheduledCommandDetailDialog(), handleCancel(), formatDateTime(), ScheduledCommandsView(), openRunDialog()

### Community 109 - ".fromResponse"
Cohesion: 0.21
Nodes (11): startTradingCredentialsChallenge(), updateClientTradingAccountCredentials(), ClientTradingAccountCredentialsDialog(), handleStartChallenge(), handleSubmit(), browserIamRequest(), extractValidationMessages(), humanizeValidationMessage() (+3 more)

### Community 110 - "listEligibleIntroducingBrokers"
Cohesion: 0.22
Nodes (9): listBonusOffers(), listEligibleIntroducingBrokers(), syncBonusOfferIntroducingBrokers(), toSearchParams(), loadEligibleIbs(), BonusOfferIntroducingBrokersDialog(), handleSubmit(), loadData() (+1 more)

### Community 111 - "bonus-offer-form-dialog.tsx"
Cohesion: 0.12
Nodes (25): createBonusOffer(), getBonusOffer(), updateBonusOffer(), BONUS_OFFER_FIELD_HELP, BonusOfferFieldLabel(), BonusOfferFormDialog(), handleSubmit(), loadFormData() (+17 more)

### Community 112 - "contest-bans-dialog.tsx"
Cohesion: 0.16
Nodes (17): revertContestBan(), abbreviateUuid(), ColumnSortHeadProps, ContestBansDialog(), applyFiltersFromDraft(), clearFilters(), commitFilters(), handleRevert() (+9 more)

### Community 113 - "trading-account-actions-menu.tsx"
Cohesion: 0.27
Nodes (9): DropdownMenu(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuSeparator(), DropdownMenuTrigger(), TradingAccountAccessAction, TradingAccountActionsMenu() (+1 more)

### Community 114 - "initial-amount/format.ts"
Cohesion: 0.15
Nodes (9): formatAccountMoney(), moneyFormatter, parseServerGroupDefaultAmount(), serverGroupNeedsInitialAmount(), InitialAmountsView(), applyFilters(), formatInitialAmount(), parseMajorAmountToMinorUnits() (+1 more)

### Community 115 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 116 - "ib-analytics-view.tsx"
Cohesion: 0.32
Nodes (3): IbAnalyticsView(), IbAnalyticsViewProps, Tab

### Community 117 - "ib-payment-template-level-form-dialog.tsx"
Cohesion: 0.15
Nodes (11): defaultLevels, IbPaymentTemplateFormDialogProps, emptyForm, FormState, getNextSortOrder(), IbPaymentTemplateLevelFormDialog(), IbPaymentTemplateLevelFormDialogProps, IbPaymentTemplateLevelsDialog() (+3 more)

### Community 118 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 119 - "PositionHistoryView"
Cohesion: 0.25
Nodes (5): listGlobalPositions(), fromSearch(), historyTab(), PositionHistoryView(), apply()

### Community 121 - "ib-analytics/api.ts"
Cohesion: 0.20
Nodes (15): getIbAnalyticsMonthly(), getIbAnalyticsSummary(), getIbAnalyticsYtd(), listIbAnalyticsRewards(), path(), toSearchParams(), IbAnalyticsAudience, IbAnalyticsCurrency (+7 more)

### Community 122 - "listServerGroupLeverages"
Cohesion: 0.33
Nodes (5): listServerGroupLeverages(), synchronizeServerGroupLeverages(), ServerGroupLeveragesSyncDialog(), handleSubmit(), loadLeverages()

### Community 123 - "ContestGlobalSettingsView"
Cohesion: 0.29
Nodes (8): getContestGlobalSettings(), mapContestGlobalSettingsResponse(), updateContestGlobalSettings(), withProxyBannerUrl(), ContestGlobalSettingsView(), handleSubmit(), settingsToForm(), parseOptionalInteger()

### Community 126 - "OpenPositionDialog"
Cohesion: 1.00
Nodes (3): OpenPositionDialog(), handleSubmit(), resetForm()

### Community 127 - "ib-referrals-content.tsx"
Cohesion: 0.20
Nodes (16): getIbReferralAccounts(), IbAnalyticsAudience, IbAnalyticsFilters, AccountsDialog(), ChildState, date(), flag(), GeoRanking() (+8 more)

### Community 128 - "handleSubmit"
Cohesion: 0.67
Nodes (3): handleSubmit(), successMessage(), toRequestBody()

### Community 129 - "NegativeBalanceRebalancesDataTable"
Cohesion: 0.67
Nodes (3): NegativeBalanceRebalancesDataTable(), applyFilters(), onFilterEnter()

### Community 130 - "plan-programs-dnd.ts"
Cohesion: 0.40
Nodes (5): AvailableProgramItem(), handleDragStart(), encodePlanProgramDragPayload(), PLAN_PROGRAM_DRAG_MIME, PlanProgramDragPayload

### Community 131 - "bonus-offer-admin-assign-dialog.tsx"
Cohesion: 0.60
Nodes (4): BonusOfferAdminAssignDialogProps, formatMinorAmount(), formatUnmetRequirement(), getUnmetSummaries()

### Community 132 - "FormElementEditorSheet"
Cohesion: 0.60
Nodes (5): FormElementEditorSheet(), addOption(), patchAttributes(), patchNode(), replaceOption()

### Community 133 - "jwf-submission-readonly.tsx"
Cohesion: 0.47
Nodes (5): displayValue(), findForm(), JwfSubmissionReadonly(), ReadonlyNode(), IbPlanSubscriptionFormSubmission

### Community 134 - "handleSubmit"
Cohesion: 0.67
Nodes (3): handleSubmit(), successMessage(), toRequestBody()

### Community 135 - "useIsMobile"
Cohesion: 0.70
Nodes (4): getIsMobileServerSnapshot(), getIsMobileSnapshot(), subscribeToMobileQuery(), useIsMobile()

### Community 137 - "syncBonusOfferServerGroups"
Cohesion: 0.50
Nodes (3): syncBonusOfferServerGroups(), BonusOfferServerGroupsDialog(), handleSubmit()

### Community 139 - "apply-position-snapshot.ts"
Cohesion: 0.53
Nodes (5): applyOpenPositionsSnapshot(), normalizeLivePosition(), toSide(), toSortableTime(), LivePositionSnapshotItem

### Community 140 - "TradingAccountResetCredentialsDialog"
Cohesion: 0.67
Nodes (3): TradingAccountResetCredentialsDialog(), handleConfirm(), validateForm()

### Community 141 - "handleSave"
Cohesion: 0.67
Nodes (3): handleSave(), draftToSyncInput(), syncBonusExcludedInstruments()

### Community 146 - "insurance-plan-option-form-dialog.tsx"
Cohesion: 0.40
Nodes (5): emptyForm, FormState, InsurancePlanOptionFormDialog(), InsurancePlanOptionFormDialogProps, optionToForm()

### Community 148 - "trading-account-access-dialog.tsx"
Cohesion: 0.33
Nodes (5): ACTION_COPY, RESTRICTING_ACTIONS, TradingAccountAccessDialog(), handleConfirm(), TradingAccountAccessDialogProps

## Knowledge Gaps
- **583 isolated node(s):** `AdminLoginPageProps`, `ClientLoginPageProps`, `AccountMetricsPageProps`, `AccountPositionsPageProps`, `Props` (+578 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatBrokerApiError()` connect `formatBrokerApiError` to `contest/api.ts`, `bonus-assignment-detail-dialog.tsx`, `ib-program-payment-rules-view.tsx`, `insurance/index.ts`, `client-risk-metrics/api.ts`, `trading-server-groups-view.tsx`, `alert-dialog.tsx`, `scheduled-command-run-dialog.tsx`, `ib-plan-subscription/index.ts`, `client-trading-account/api.ts`, `client-insurances-view.tsx`, `form-builder-view.tsx`, `ib-admin-analytics-view.tsx`, `bonus-assignment-logs-view.tsx`, `browserBrokerRequest`, `finance-transactions-view.tsx`, `client-ib/api.ts`, `forms-view.tsx`, `public-risk-metrics-view.tsx`, `ib-rewards-view.tsx`, `contest-workspace-panels.tsx`, `trading-server/format.ts`, `IbPlanProgramsSyncView`, `risk-control/api.ts`, `client-bonuses-view.tsx`, `contest-subscription-ban-dialog.tsx`, `TradingAccountPositionsDialog`, `client-analytics-behavior-panel.tsx`, `card.tsx`, `ib-volume-reward-trades-report-view.tsx`, `client-analytics-profitability-panel.tsx`, `IbProgramSymbolsView`, `ib-reward-logs-view.tsx`, `forms-list-view.tsx`, `ib-plan/api.ts`, `trading-accounts-view.tsx`, `bonus-offer-template/api.ts`, `trading-migrations-view.tsx`, `BonusAssignmentLogsView`, `ib-earnings-content.tsx`, `ib-volume-reward-trades/types.ts`, `initial-amount/api.ts`, `configuration-view.tsx`, `client-analytics-dashboard-panel.tsx`, `BonusOffersView`, `ib-program/api.ts`, `FormBuilderView`, `dialog.tsx`, `positions-report-view.tsx`, `button.tsx`, `client-analytics-symbol-panel.tsx`, `symbol-category/api.ts`, `ib-admin-analytics/api.ts`, `PlatformsView`, `bonus-offers-view.tsx`, `IbPlanSubscriptionsView`, `client-positions-panel.tsx`, `broker-response.ts`, `client-bonus/api.ts`, `contest-general-form.tsx`, `TradingServerGroupsView`, `listServerGroupsForAdmin`, `contest-subscriptions-view.tsx`, `contest-workspace-view.tsx`, `errors.ts`, `api-error-alert.tsx`, `account-insurance-claim-dialogs.tsx`, `ib-subscription-form-dialog.tsx`, `client-analytics-risk-drawdown-panel.tsx`, `leverage/api.ts`, `skeleton.tsx`, `ib-progression-template/api.ts`, `TradingAccountsView`, `ib-partner-tier-panel.tsx`, `ContestAwardsView`, `ContestConditionsView`, `IbPlansView`, `BonusOfferAdminAssignDialog`, `RiskMetricsShareDialog`, `BonusOfferTemplatesView`, `RejectionTemplatesView`, `config-form.ts`, `(portal)/layout.tsx`, `ScheduledCommandsView`, `IbProgramsView`, `.fromResponse`, `listEligibleIntroducingBrokers`, `bonus-offer-form-dialog.tsx`, `contest-bans-dialog.tsx`, `initial-amount/format.ts`, `ib-payment-template-level-form-dialog.tsx`, `PositionHistoryView`, `TradingServersView`, `listServerGroupLeverages`, `ContestGlobalSettingsView`, `LeveragesView`, `OpenPositionDialog`, `ib-referrals-content.tsx`, `handleSubmit`, `NegativeBalanceRebalancesDataTable`, `bonus-offer-admin-assign-dialog.tsx`, `handleSubmit`, `syncBonusOfferServerGroups`, `TradingAccountResetCredentialsDialog`, `handleSave`, `insurance-plan-option-form-dialog.tsx`, `trading-account-access-dialog.tsx`?**
  _High betweenness centrality (0.268) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `plan-programs-dnd.ts`, `ib-program-payment-rules-view.tsx`, `sidebar.tsx`, `client-risk-metrics/api.ts`, `trading-server-groups-view.tsx`, `alert-dialog.tsx`, `insurance/index.ts`, `scheduled-command-run-dialog.tsx`, `client-insurances-view.tsx`, `form-builder-view.tsx`, `ib-admin-analytics-view.tsx`, `bonus-assignment-logs-view.tsx`, `client-ib/api.ts`, `forms-view.tsx`, `ib-rewards-view.tsx`, `IbPlanProgramsSyncView`, `contest-subscription-ban-dialog.tsx`, `client-analytics-behavior-panel.tsx`, `card.tsx`, `ib-volume-reward-trades-report-view.tsx`, `client-analytics-profitability-panel.tsx`, `IbProgramSymbolsView`, `ib-reward-logs-view.tsx`, `client-risk-metrics-view.tsx`, `trading-accounts-view.tsx`, `trading-migrations-view.tsx`, `BonusAssignmentLogsView`, `ib-earnings-content.tsx`, `ib-volume-reward-trades/types.ts`, `configuration-view.tsx`, `client-analytics-dashboard-panel.tsx`, `ib-program/api.ts`, `FormBuilderView`, `dialog.tsx`, `positions-report-view.tsx`, `button.tsx`, `client-analytics-symbol-panel.tsx`, `ib-admin-analytics/api.ts`, `listServerGroupsForAdmin`, `contest-subscriptions-view.tsx`, `contest-workspace-view.tsx`, `errors.ts`, `api-error-alert.tsx`, `client-analytics-risk-drawdown-panel.tsx`, `tooltip.tsx`, `skeleton.tsx`, `TradingAccountsView`, `(portal)/layout.tsx`, `ScheduledCommandsView`, `IbProgramsView`, `contest-bans-dialog.tsx`, `trading-account-actions-menu.tsx`, `ContestGlobalSettingsView`, `ib-referrals-content.tsx`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Why does `browserBrokerRequest()` connect `browserBrokerRequest` to `contest/api.ts`, `bonus-assignment-detail-dialog.tsx`, `ib-program-payment-rules-view.tsx`, `insurance/index.ts`, `client-risk-metrics/api.ts`, `alert-dialog.tsx`, `scheduled-command-run-dialog.tsx`, `syncBonusOfferServerGroups`, `client-trading-account/api.ts`, `client-insurances-view.tsx`, `form-builder-view.tsx`, `handleSave`, `ib-plan-subscription/index.ts`, `bonus-assignment-logs-view.tsx`, `trading-server/api.ts`, `finance-transactions-view.tsx`, `client-ib/api.ts`, `forms-view.tsx`, `formatBrokerApiError`, `public-risk-metrics-view.tsx`, `ib-rewards-view.tsx`, `contest-workspace-panels.tsx`, `bonus-offer/api.ts`, `trading-server/format.ts`, `risk-control/api.ts`, `client-bonuses-view.tsx`, `contest-subscription-ban-dialog.tsx`, `trading-account/api.ts`, `TradingAccountPositionsDialog`, `ib-volume-reward-trades-report-view.tsx`, `IbProgramSymbolsView`, `ib-reward-logs-view.tsx`, `forms-list-view.tsx`, `ib-plan/api.ts`, `trading-accounts-view.tsx`, `bonus-offer-template/api.ts`, `trading-migrations-view.tsx`, `ib-volume-reward-trades/types.ts`, `initial-amount/api.ts`, `configuration-view.tsx`, `use-account-positions-channel.ts`, `ib-program/api.ts`, `FormBuilderView`, `positions-report-view.tsx`, `symbol-category/api.ts`, `ib-admin-analytics/api.ts`, `client-positions-panel.tsx`, `broker-response.ts`, `client-bonus/api.ts`, `contest-general-form.tsx`, `contest-subscriptions-view.tsx`, `contest-workspace-view.tsx`, `ib-subscription-form-dialog.tsx`, `browser-client.ts`, `leverage/api.ts`, `ib-progression-template/api.ts`, `ib-partner-tier-panel.tsx`, `RiskMetricsShareDialog`, `(portal)/layout.tsx`, `ScheduledCommandsView`, `.fromResponse`, `listEligibleIntroducingBrokers`, `bonus-offer-form-dialog.tsx`, `contest-bans-dialog.tsx`, `PositionHistoryView`, `ib-analytics/api.ts`, `listServerGroupLeverages`, `ib-referrals-content.tsx`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **What connects `AdminLoginPageProps`, `ClientLoginPageProps`, `AccountMetricsPageProps` to the rest of the system?**
  _583 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `contest/api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09071117561683599 - nodes in this community are weakly interconnected._
- **Should `ib-program-payment-rules-view.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06354642313546423 - nodes in this community are weakly interconnected._
- **Should `insurance/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05516431924882629 - nodes in this community are weakly interconnected._