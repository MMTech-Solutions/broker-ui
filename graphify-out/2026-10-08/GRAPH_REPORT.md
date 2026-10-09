# Graph Report - mmt-broker-basic-ui  (2026-10-05)

## Corpus Check
- 459 files · ~190,352 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3306 nodes · 12234 edges · 155 communities (135 shown, 20 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `070a787c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- contest/api.ts
- bonus-assignment-logs-view.tsx
- ib-program-payment-rules-view.tsx
- insurance/index.ts
- cn
- client-risk-metrics/api.ts
- trading-server-groups-view.tsx
- alert-dialog.tsx
- scheduled-command-detail-dialog.tsx
- ib-plan-subscription/index.ts
- client-trading-accounts-view.tsx
- client-insurances-view.tsx
- form-builder-view.tsx
- ib-admin-analytics-view.tsx
- trading-server/api.ts
- bonus-assignment-logs/index.ts
- client-contest-detail-view.tsx
- finance-transactions-view.tsx
- client-ib-progression-panel.tsx
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
- risk-control-view.tsx
- client-bonuses-view.tsx
- rejection-reason-composer.tsx
- trading-accounts-view.tsx
- client-positions-panel.tsx
- client-analytics-behavior-panel.tsx
- position-commission-rewards-dialog.tsx
- card.tsx
- ib-volume-reward-trades-report-view.tsx
- client-analytics-profitability-panel.tsx
- IbProgramSymbolsView
- ib-reward-logs/index.ts
- compilerOptions
- forms-list-view.tsx
- client-risk-metrics-view.tsx
- ib-plan/api.ts
- login-form.tsx
- site-header.tsx
- bonus-offer-template/api.ts
- trading-migration/api.ts
- BonusAssignmentLogsView
- ib-earnings-content.tsx
- readSession
- initial-amount/api.ts
- configuration/api.ts
- client-analytics-dashboard-panel.tsx
- components.json
- BonusOffersView
- use-account-positions-channel.ts
- auth.ts
- ib-program/api.ts
- FormBuilderView
- button.tsx
- positions-report-view.tsx
- server-group-edit-sheet.tsx
- devDependencies
- dependencies
- client-analytics-symbol-panel.tsx
- symbol-category-delete-dialog.tsx
- ib-admin-analytics/api.ts
- PlatformsView
- broker-response.ts
- IbPlanSubscriptionsView
- client-positions/api.ts
- position-history-view.tsx
- use-trading-stream-positions-channel.ts
- client-bonus/api.ts
- ib-admin-analytics/types.ts
- contest-general-form.tsx
- TradingServerGroupsView
- listServerGroupsForAdmin
- ContestSubscriptionsView
- contest-workspace-view.tsx
- errors.ts
- subscriptionStatusLabel
- api-error-alert.tsx
- session.server.ts
- ib-subscription-form-dialog.tsx
- client-analytics-risk-drawdown-panel.tsx
- browser-client.ts
- trading-servers-view.tsx
- leverage/api.ts
- skeleton.tsx
- ib-progression-template/api.ts
- IbPaymentTemplatesView
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
- area-switcher.tsx
- ClientTradingAccountsView
- IbProgramsView
- session-constants.ts
- getBonusOffer
- bonus-offer-form-dialog.tsx
- ContestBansDialog
- broker/[...path]/route.ts
- initial-amount/format.ts
- scripts
- ib-analytics-view.tsx
- Button
- README.md
- risk-metrics-summary-cards.tsx
- insurance-plan-form-dialog.tsx
- browserBrokerRequest
- listServerGroupLeverages
- ContestGlobalSettingsView
- class-variance-authority
- LeveragesView
- closePosition
- ib-referrals-content.tsx
- set-symbols-category-dialog.tsx
- listBonusNegativeBalanceCompensations
- plan-programs-dnd.ts
- bonus-offer-admin-assign-dialog.tsx
- FormElementEditorSheet
- jwf-submission-readonly.tsx
- handleSubmit
- useIsMobile
- BonusOfferServerGroupsDialog
- eslint.config.mjs
- bonus-offer-delete-dialog.tsx
- ib-plan-form-dialog.tsx
- ib-plan-subscription-form-dialog.tsx
- laravel-echo
- next.config.ts
- pusher-js
- ib-program-form-dialog.tsx
- insurance-plan-option-form-dialog.tsx
- postcss.config.mjs
- trading-account-access-dialog.tsx
- client/contests/[contestId]/page.tsx
- subscriptions/page.tsx
- server-groups/page.tsx
- cancelBonusAssignment
- react-dom
- react

## God Nodes (most connected - your core abstractions)
1. `formatBrokerApiError()` - 382 edges
2. `browserBrokerRequest()` - 282 edges
3. `cn()` - 234 edges
4. `ApiErrorAlert()` - 150 edges
5. `Button()` - 138 edges
6. `Skeleton()` - 98 edges
7. `Label()` - 88 edges
8. `Input()` - 83 edges
9. `DialogContent()` - 69 edges
10. `DialogHeader()` - 69 edges

## Surprising Connections (you probably didn't know these)
- `handle()` --calls--> `proxyBrokerRequest()`  [EXTRACTED]
  app/api/broker/[...path]/route.ts → lib/api/broker-client.ts
- `DropdownMenuLabel()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts
- `SheetOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sheet.tsx → lib/utils.ts
- `handleSubscribe()` --calls--> `formatBrokerApiError()`  [EXTRACTED]
  features/client-ib/components/client-ib-plan-card.tsx → lib/api/errors.ts
- `getPublicRiskMetricsHistory()` --calls--> `browserBrokerRequest()`  [EXTRACTED]
  features/client-risk-metrics/api.ts → lib/api/browser-client.ts

## Import Cycles
- None detected.

## Communities (155 total, 20 thin omitted)

### Community 0 - "contest/api.ts"
Cohesion: 0.09
Nodes (49): buildServerGroupLabel(), createContestCondition(), deleteContest(), deleteContestAward(), deleteContestCondition(), invalidateContestFormCatalog(), listEligibleIntroducingBrokers(), loadContestFormCatalog() (+41 more)

### Community 1 - "bonus-assignment-logs-view.tsx"
Cohesion: 0.24
Nodes (20): BonusAssignmentDetailDialog(), BonusAssignmentDetailDialogProps, abbreviateUuid(), AssignmentsTable(), breadcrumbs, ColumnSortHeadProps, DepositIntentsTable(), logsTabs (+12 more)

### Community 2 - "ib-program-payment-rules-view.tsx"
Cohesion: 0.07
Nodes (53): createIbPaymentTemplate(), createIbPaymentTemplateLevel(), deleteIbPaymentTemplate(), deleteIbPaymentTemplateLevel(), listIbPaymentTemplates(), updateIbPaymentTemplateLevel(), createLevelDraft(), IbPaymentTemplateFormDialog() (+45 more)

### Community 3 - "insurance/index.ts"
Cohesion: 0.05
Nodes (60): approveAccountInsuranceClaim(), compactFilters(), createInsurancePlan(), createInsurancePlanOption(), deleteInsurancePlan(), deleteInsurancePlanOption(), getInsurancePlan(), listAccountInsurancesAdmin() (+52 more)

### Community 4 - "cn"
Cohesion: 0.05
Nodes (67): AppSidebar(), bonusNavigation, contestsNavigation, ibNavigation, insuranceNavigation, reportsNavigation, systemNavigation, tradingNavigation (+59 more)

### Community 5 - "client-risk-metrics/api.ts"
Cohesion: 0.08
Nodes (43): analyticsOverviewInflight, analyticsOverviewRequestKey(), getAccountAnalyticsDrawdowns(), getAccountAnalyticsDurationScatter(), getAccountAnalyticsEquityCurve(), getAccountAnalyticsOverview(), getAccountAnalyticsPnlDistribution(), getAccountAnalyticsProfitability() (+35 more)

### Community 6 - "trading-server-groups-view.tsx"
Cohesion: 0.05
Nodes (54): TradingServerGroupSecuritiesPageProps, PageNumberPagination(), Alert(), AlertDescription(), AlertTitle(), alertVariants, appendPlatformFormData(), createPlatform() (+46 more)

### Community 7 - "alert-dialog.tsx"
Cohesion: 0.17
Nodes (27): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogTitle() (+19 more)

### Community 8 - "scheduled-command-detail-dialog.tsx"
Cohesion: 0.08
Nodes (46): ACTIVE_RUN_BLOCK_MESSAGE, hasActiveScheduledCommandRun(), buildListSearchParams(), cancelScheduledCommandRun(), getScheduledCommand(), listScheduledCommands(), runScheduledCommand(), updateScheduledCommand() (+38 more)

### Community 9 - "ib-plan-subscription/index.ts"
Cohesion: 0.12
Nodes (33): adminSubscriptionsPath(), createIbPlanSubscription(), getIbPlanSubscriptionFormSubmission(), listIbPlanSubscriptionAdminInteractions(), listIbPlanSubscriptions(), toSearchParams(), updateIbPlanSubscription(), updateIbPlanSubscriptionParameters() (+25 more)

### Community 10 - "client-trading-accounts-view.tsx"
Cohesion: 0.11
Nodes (27): createClientTradingAccount(), listClientServerGroupsForSelection(), loadClientAccountCatalog(), startTradingCredentialsChallenge(), toClientServerGroup(), updateClientTradingAccountCredentials(), ClientTradingAccountCreateDialog(), handleSubmit() (+19 more)

### Community 11 - "client-insurances-view.tsx"
Cohesion: 0.09
Nodes (44): cancelClientAccountInsurance(), claimClientAccountInsurance(), compactFilters(), contractClientAccountInsurance(), isInsuranceCandidateAccount(), listClientAccountInsurances(), listInsurancePlansForAccount(), loadAccountsWithInProgressInsurance() (+36 more)

### Community 12 - "form-builder-view.tsx"
Cohesion: 0.20
Nodes (14): BuilderTab, FormBuilderViewProps, InputPreview(), JwfFormPreview(), JwfFormPreviewProps, stringAttribute(), FORM_INPUT_TYPES, FormListFilters (+6 more)

### Community 13 - "ib-admin-analytics-view.tsx"
Cohesion: 0.14
Nodes (21): AnalyticsKpis(), AnalyticsSeriesChart(), AnalyticsTab, availabilityReason(), CATEGORY_COLORS, CategoryDistribution(), ClientFunnel(), CommissionBySource() (+13 more)

### Community 14 - "trading-server/api.ts"
Cohesion: 0.10
Nodes (44): loadLeverages(), cachedEnvironmentsByAudience, configSchemasByPlatform, configSchemasDeniedPlatforms, createTradingServer(), deleteTradingServer(), getTradingServer(), listCatalogServerGroupLeverages() (+36 more)

### Community 15 - "bonus-assignment-logs/index.ts"
Cohesion: 0.13
Nodes (28): compactFilters(), getBonusAssignment(), listBonusAssignments(), listDepositBonusIntents(), loadAssignment(), BONUS_ASSIGNMENT_STATUSES, BonusAssignment, BonusAssignmentDepositAmount (+20 more)

### Community 16 - "client-contest-detail-view.tsx"
Cohesion: 0.10
Nodes (35): ClientContestsPage(), compactFilters(), getContestBannerUrl(), getContestLeaderboardTop(), getContestRegistrationOptions(), getContestSubscription(), getPublicContest(), listContestLeaderboard() (+27 more)

### Community 17 - "finance-transactions-view.tsx"
Cohesion: 0.19
Nodes (11): listFinanceTransactions(), showFinanceTransaction(), amountLabel(), dateLabel(), Detail(), FinanceTransactionsView(), labels, FinanceAccount (+3 more)

### Community 18 - "client-ib-progression-panel.tsx"
Cohesion: 0.14
Nodes (24): compactFilters(), getActiveIbPlanContext(), getMyIbPlanSubscription(), listClientIbPlans(), listMyIbPlanProgressionLogs(), subscribeToIbPlan(), withProxyClientPlan(), withProxyProgramImage() (+16 more)

### Community 19 - "forms-view.tsx"
Cohesion: 0.14
Nodes (18): createForm(), getFormVersion(), listForms(), publishFormVersion(), saveFormDraft(), publish(), save(), addNode() (+10 more)

### Community 20 - "formatBrokerApiError"
Cohesion: 0.05
Nodes (43): BonusOfferTemplateDeleteDialog(), handleDelete(), ContestAwardDeleteDialog(), handleDelete(), ContestConditionDeleteDialog(), handleDelete(), ContestDeleteDialog(), handleDelete() (+35 more)

### Community 21 - "public-risk-metrics-view.tsx"
Cohesion: 0.08
Nodes (25): PublicRiskMetricsPageProps, getPublicRiskMetricsSummary(), applyLiveEquityChange(), applyRiskMetricChanges(), parseMetricJsonValue(), toUnixSecond(), toUtcDateKey(), PublicAnalyticsOverviewView() (+17 more)

### Community 22 - "client-risk-metrics/types.ts"
Cohesion: 0.05
Nodes (38): AnalyticsCumulativePnl, AnalyticsDailyDayBehavior, AnalyticsDailyStats, AnalyticsDailyStreakSegment, AnalyticsDailyTradeRow, AnalyticsDailyTransitionMatrix, AnalyticsDurationScatterPoint, AnalyticsEquityCurvePoint (+30 more)

### Community 23 - "form-document.ts"
Cohesion: 0.17
Nodes (23): removeElement(), addFormElement(), collectInputNames(), containerPath(), containsNode(), editableForm(), findFormElement(), findNode() (+15 more)

### Community 24 - "broker-client.ts"
Cohesion: 0.13
Nodes (23): buildIamUpstreamUrl(), DELETE, GET, handle(), PATCH, POST, PUT, RouteContext (+15 more)

### Community 25 - "ib-rewards-view.tsx"
Cohesion: 0.20
Nodes (19): IbProgram, compactFilters(), listIbRewards(), breadcrumbs, IbRewardsView(), RewardParticipantCell(), truncateId(), formatDateTimeValue() (+11 more)

### Community 26 - "contest-workspace-panels.tsx"
Cohesion: 0.11
Nodes (31): assignContestAward(), assignContestCondition(), listAssignedContestAwards(), listAssignedContestConditions(), listContestAwards(), listContestBans(), listContestConditions(), revertContestBan() (+23 more)

### Community 27 - "bonus-offer/api.ts"
Cohesion: 0.13
Nodes (33): adminAssignBonus(), deleteBonusOffer(), listBonusOfferTemplates(), listEligibleAccountsForBonusOfferAdmin(), loadBonusOfferFormCatalog(), syncBonusExcludedInstruments(), syncBonusOfferServerGroups(), AdminAssignBonusInput (+25 more)

### Community 28 - "trading-server/format.ts"
Cohesion: 0.13
Nodes (27): toServerGroupOption(), toServerGroupOption(), emptyCountryRow(), ServerGroupEditSheet(), handleSubmit(), buildServerGroupEditFormState(), buildUpdateServerGroupInput(), CLIENT_TRADING_TERM_ROWS (+19 more)

### Community 29 - "IbPlanProgramsSyncView"
Cohesion: 0.14
Nodes (24): IbPlanProgramPivotFormDialog(), handleSubmit(), formatProgressionMaxVolume(), IbPlanProgramsSyncView(), handleAssignedDrop(), handleDropOnAssigned(), handleDropOnAssignedRow(), handleDropOnAvailable() (+16 more)

### Community 30 - "risk-control-view.tsx"
Cohesion: 0.10
Nodes (31): Props, Props, archiveRiskControlRule(), createRiskControlRule(), listRiskControlExecutions(), listRiskControlRules(), loadRiskControlCatalog(), prefix() (+23 more)

### Community 31 - "client-bonuses-view.tsx"
Cohesion: 0.16
Nodes (24): getClientBonusAssignment(), listAvailableBonusOffers(), ClientBonusAssignmentDetailDialog(), loadAssignment(), ClientBonusAssignmentDetailDialogProps, ClientBonusClaimDialog(), clientBonusesBreadcrumbs, ClientBonusesView() (+16 more)

### Community 32 - "rejection-reason-composer.tsx"
Cohesion: 0.19
Nodes (21): compactFilters(), createRejectionTemplate(), deleteRejectionTemplate(), getRejectionTemplate(), listRejectionTemplates(), updateRejectionTemplate(), RejectionReasonComposer, RejectionReasonComposerHandle (+13 more)

### Community 33 - "trading-accounts-view.tsx"
Cohesion: 0.05
Nodes (57): DropdownMenu(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuSeparator(), DropdownMenuTrigger(), TableFooter(), ListTradingAccountPositionsParams (+49 more)

### Community 34 - "client-positions-panel.tsx"
Cohesion: 0.15
Nodes (14): AccountPositionsPageProps, accountHistoryPath(), listAccountPositions(), ClientPositionsPanel(), ClientPositionsPanelProps, emptyStateByFilter, PositionsFilter, formatNumber() (+6 more)

### Community 35 - "client-analytics-behavior-panel.tsx"
Cohesion: 0.10
Nodes (27): getAccountAnalyticsBehavior(), getAccountAnalyticsDaily(), getAccountAnalyticsDailyDayTrades(), buildCalendarGrid(), CalendarMonthView(), CalendarViewMode, CalendarYearView(), ClientAnalyticsBehaviorPanel() (+19 more)

### Community 36 - "position-commission-rewards-dialog.tsx"
Cohesion: 0.47
Nodes (5): listPositionCommissionRewards(), formatAmount(), PositionCommissionRewardsDialog(), loadRewards(), PositionCommissionRewardsDialogProps

### Community 37 - "card.tsx"
Cohesion: 0.16
Nodes (17): BrokerRequestCredentials(), Card(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle(), getPublicContestGlobalSettings() (+9 more)

### Community 38 - "ib-volume-reward-trades-report-view.tsx"
Cohesion: 0.07
Nodes (55): buildReportSearchParams(), exportIbVolumeRewardTrades(), getIbVolumeRewardTradeRewards(), listIbVolumeRewardTrades(), DEFAULT_FILTERS, EMPTY_DRAFT, FilterDraft, IbVolumeRewardTradesReportView() (+47 more)

### Community 39 - "client-analytics-profitability-panel.tsx"
Cohesion: 0.11
Nodes (19): AnalyticsPanelCard(), BreakEvenGauge(), ClientAnalyticsProfitabilityPanel(), ClientAnalyticsProfitabilityPanelProps, CumulativeGranularity, DirectionBreakdown(), ExpectancyContributionBar(), formatCurrency() (+11 more)

### Community 40 - "IbProgramSymbolsView"
Cohesion: 0.12
Nodes (21): ibProgramPath(), listAllIbProgramSymbols(), listIbProgramSymbols(), syncIbProgramSymbols(), IbProgramSymbolConfigSheet(), IbProgramSymbolsView(), handleAddSymbol(), handleSave() (+13 more)

### Community 41 - "ib-reward-logs/index.ts"
Cohesion: 0.16
Nodes (17): compactFilters(), listIbRewardSettlementRuns(), listIbTradingAccountPeriodSnapshots(), IbRewardLogsView(), isRewardLogTab(), truncateId(), formatDateTimeValue(), formatMoneyValue() (+9 more)

### Community 42 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 43 - "forms-list-view.tsx"
Cohesion: 0.19
Nodes (15): archiveFormVersion(), cloneFormVersion(), deleteForm(), builderPath(), editableVersion(), formatVersionDate(), FormsListView(), archive() (+7 more)

### Community 44 - "client-risk-metrics-view.tsx"
Cohesion: 0.10
Nodes (21): ANALYTICS_TABS, AnalyticsTab, applyAnalyticsUpdate(), applyDashboardMetrics(), applyPhaseMetricsUpdate(), ClientRiskMetricsView(), ClientRiskMetricsViewProps, DATE_RANGE_OPTIONS (+13 more)

### Community 45 - "ib-plan/api.ts"
Cohesion: 0.13
Nodes (30): appendIbPlanFormData(), createIbPlan(), deleteIbPlan(), listIbPlanPrograms(), listIbPlans(), mapIbPlanResponse(), mapIbPlansResponse(), seedIbDemoCatalog() (+22 more)

### Community 46 - "login-form.tsx"
Cohesion: 0.16
Nodes (13): formAction(), LoginForm(), LoginFormProps, twoFaPrompt(), LogoutButton(), LogoutButtonProps, DEFAULT_POST_LOGIN, AuthArea (+5 more)

### Community 47 - "site-header.tsx"
Cohesion: 0.05
Nodes (8): AccountMetricsPageProps, IbPlanProgramsPageProps, TradingServersPageProps, TradingSecuritiesPageProps, TradingServerSecuritySymbolsPageProps, TradingSymbolsPageProps, SiteHeader(), SiteHeaderProps

### Community 48 - "bonus-offer-template/api.ts"
Cohesion: 0.13
Nodes (26): handleSave(), draftToSyncInput(), createBonusOfferTemplate(), deleteBonusOfferTemplate(), getBonusOfferTemplate(), listBonusOfferTemplates(), syncBonusOfferTemplateExcludedInstruments(), toSearchParams() (+18 more)

### Community 49 - "trading-migration/api.ts"
Cohesion: 0.10
Nodes (19): getMigrationRun(), listMigrationAccounts(), listMigrationRuns(), PaginatedResponse, startTradingMigration(), formatDate(), labelForStatus(), RunDetailsDialog() (+11 more)

### Community 50 - "BonusAssignmentLogsView"
Cohesion: 0.19
Nodes (13): assignmentFormToFilters(), BonusAssignmentLogsView(), clearFilters(), commitAssignmentFilters(), commitIntentFilters(), onAssignmentFilterEnter(), onIntentFilterEnter(), patchAssignmentDraft() (+5 more)

### Community 51 - "ib-earnings-content.tsx"
Cohesion: 0.16
Nodes (17): EarningsCards(), EarningsControls, EarningsRow(), formatDate(), formatMoney(), IbEarningsContent(), IbEarningsContentProps, rateLabel() (+9 more)

### Community 52 - "readSession"
Cohesion: 0.21
Nodes (15): AdminLoginPage(), AdminLoginPageProps, ClientLoginPage(), ClientLoginPageProps, ClientHomePage(), DashboardPage(), loginHref(), resolveAuthArea() (+7 more)

### Community 53 - "initial-amount/api.ts"
Cohesion: 0.19
Nodes (13): compactFilters(), createInitialAmount(), getInitialAmount(), listInitialAmounts(), updateInitialAmount(), InitialAmountFormDialog(), handleSubmit(), CreateInitialAmountInput (+5 more)

### Community 54 - "configuration/api.ts"
Cohesion: 0.17
Nodes (15): listConfigs(), updateConfigsBatch(), ConfigurationView(), handleSave(), CATEGORY_LABELS, categoryLabel(), displayValueForForm(), groupConfigsByCategory() (+7 more)

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
Cohesion: 0.23
Nodes (18): iamForwardHeaders(), LOGIN_PATH, loginAction(), logoutAction(), parseArea(), iamApiBase(), iamLogin(), iamLogout() (+10 more)

### Community 60 - "ib-program/api.ts"
Cohesion: 0.25
Nodes (14): appendIbProgramFormData(), createIbProgram(), deleteIbProgram(), mapIbProgramResponse(), mapIbProgramsResponse(), updateIbProgram(), withProxyImagePath(), handleSubmit() (+6 more)

### Community 61 - "FormBuilderView"
Cohesion: 0.19
Nodes (10): FormBuilderPageProps, getForm(), elementTitle(), FormBuilderView(), addElement(), changeDocument(), dropIntoContainer(), updateElement() (+2 more)

### Community 62 - "button.tsx"
Cohesion: 0.10
Nodes (35): BrokerRequestCredentialsProps, CredentialValue(), Dialog(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogTitle() (+27 more)

### Community 63 - "positions-report-view.tsx"
Cohesion: 0.09
Nodes (26): listIbPrograms(), buildPositionsReportSearchParams(), exportPositionsReport(), getPositionReportDetail(), listPositionsReport(), identity(), PositionReportDetailDialog(), activeCount() (+18 more)

### Community 64 - "server-group-edit-sheet.tsx"
Cohesion: 0.23
Nodes (11): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), FormElementEditorSheetProps (+3 more)

### Community 65 - "devDependencies"
Cohesion: 0.11
Nodes (19): babel-plugin-react-compiler, eslint, eslint-config-next, devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, tailwindcss (+11 more)

### Community 66 - "dependencies"
Cohesion: 0.11
Nodes (19): @base-ui/react, clsx, lightweight-charts, lucide-react, next, dependencies, @base-ui/react, clsx (+11 more)

### Community 67 - "client-analytics-symbol-panel.tsx"
Cohesion: 0.18
Nodes (17): getAccountAnalyticsSymbols(), ClientAnalyticsSymbolPanel(), load(), ClientAnalyticsSymbolPanelProps, formatNumber(), formatPercent(), formatSideLabel(), formatSymbolMetric() (+9 more)

### Community 68 - "symbol-category-delete-dialog.tsx"
Cohesion: 0.17
Nodes (16): compactFilters(), createSymbolCategory(), deleteSymbolCategory(), listAllSymbolCategories(), listSymbolCategories(), updateSymbolCategory(), SymbolCategoriesView(), SymbolCategoryDeleteDialog() (+8 more)

### Community 69 - "ib-admin-analytics/api.ts"
Cohesion: 0.16
Nodes (19): earningsSearchParams(), getIbAnalytics(), getIbAnalyticsOverview(), getIbEarnings(), getIbEarningsDailyTrades(), getIbReferrals(), getIbReferralsGeo(), IbAnalyticsOverviewFilters (+11 more)

### Community 71 - "broker-response.ts"
Cohesion: 0.13
Nodes (14): bonusOfferExcludedInstrumentsPath(), bonusOfferTemplateExcludedInstrumentsPath(), bonusOffersBreadcrumbs, bonusOfferTypeLabels, ColumnSortHeadProps, formToAppliedFilters(), parseOptionalNumber(), bonusOfferTemplatesBreadcrumbs (+6 more)

### Community 72 - "IbPlanSubscriptionsView"
Cohesion: 0.15
Nodes (8): abbreviateUuid(), formToAppliedFilters(), IbPlanSubscriptionsView(), applyFiltersFromDraft(), clearFilters(), commitFilters(), onFilterEnter(), parseOptionalNumber()

### Community 73 - "client-positions/api.ts"
Cohesion: 0.21
Nodes (13): applyOpenPositionsSnapshot(), normalizeLivePosition(), toSide(), toSortableTime(), AccountPosition, ClosePositionInput, ListAccountPositionsParams, LivePositionSnapshotItem (+5 more)

### Community 74 - "position-history-view.tsx"
Cohesion: 0.18
Nodes (11): listGlobalPositions(), DEFAULTS, FILTER_KEYS, fromSearch(), historyTab(), PositionHistoryView(), apply(), PositionsTab (+3 more)

### Community 75 - "use-trading-stream-positions-channel.ts"
Cohesion: 0.19
Nodes (14): GatewayPosition, GatewayPositionsEvent, GatewaySubscriptionRejected, GatewayWelcomeFrame, isPositionsEvent(), isRecord(), isSubscriptionRejected(), isWelcomeFrame() (+6 more)

### Community 76 - "client-bonus/api.ts"
Cohesion: 0.17
Nodes (13): claimBonusOffer(), compactFilters(), listClientBonusAssignments(), listEligibleAccountsForBonusOffer(), handleSubmit(), loadAccounts(), BonusAssignmentStatus, ClaimBonusOfferInput (+5 more)

### Community 77 - "ib-admin-analytics/types.ts"
Cohesion: 0.12
Nodes (16): IbAnalyticsAvailability, IbAnalyticsCountry, IbAnalyticsHistoricalRule, IbAnalyticsMetricGroup, IbAnalyticsMoney, IbAnalyticsMoneyAvailability, IbAnalyticsMoneyBreakdown, IbEarningsCards (+8 more)

### Community 78 - "contest-general-form.tsx"
Cohesion: 0.26
Nodes (12): createContest(), updateContest(), amountStep(), ContestGeneralForm(), handleSubmit(), ContestGeneralFormProps, contestToForm(), emptyForm (+4 more)

### Community 79 - "TradingServerGroupsView"
Cohesion: 0.11
Nodes (6): formToAppliedFilters(), TradingServerGroupsView(), applyFilters(), TradingServersView(), formatBookTypeLabel(), formatConfigurationWarning()

### Community 80 - "listServerGroupsForAdmin"
Cohesion: 0.20
Nodes (13): BonusExcludedInstrumentsView(), handleAddSymbol(), ExcludedInstrumentDraft, draftsSignature(), excludedInstrumentFromApi(), excludedInstrumentFromTradingSymbol(), excludedInstrumentKey(), loadData() (+5 more)

### Community 81 - "ContestSubscriptionsView"
Cohesion: 0.14
Nodes (17): listContestParticipants(), listContests(), storeContestBan(), toSearchParams(), ContestSubscriptionBanDialog(), handleBan(), abbreviateUuid(), ContestSubscriptionsView() (+9 more)

### Community 82 - "contest-workspace-view.tsx"
Cohesion: 0.20
Nodes (12): tabs, ClientContestsView(), getContest(), ContestWorkspaceTab, ContestWorkspaceView(), tabs, ContestsView(), CONTEST_WARNING_LABELS (+4 more)

### Community 83 - "errors.ts"
Cohesion: 0.11
Nodes (28): buildPageItems(), PAGE_SIZE_OPTIONS, PageNumberPaginationProps, subscribeToHydration(), SelectContent(), SelectItem(), SelectTrigger(), SelectValue() (+20 more)

### Community 84 - "subscriptionStatusLabel"
Cohesion: 0.18
Nodes (11): ClientIbPlanCard(), handleSubscribe(), clientIbPlanSubscriptionTypeLabel(), clientIbSubscriptionStatusLabel(), adminLabel(), IbPlanSubscriptionAdminInteractionsDialog(), loadInteractions(), IbPlanSubscriptionDetailDialog() (+3 more)

### Community 85 - "api-error-alert.tsx"
Cohesion: 0.14
Nodes (22): ApiErrorAlert(), ApiErrorAlertProps, Checkbox(), Label(), CancelBonusAssignmentDialogProps, BonusOfferIntroducingBrokersDialogProps, BonusOfferServerGroupsDialogProps, ServerGroupOption (+14 more)

### Community 86 - "session.server.ts"
Cohesion: 0.22
Nodes (15): decodeJwtPayload(), displayNameFromClaims(), jwtPayloadSegment(), sessionCookieName(), decryptSession(), encryptSession(), sessionCookieMaxMs(), accessTokenStale() (+7 more)

### Community 87 - "ib-subscription-form-dialog.tsx"
Cohesion: 0.33
Nodes (7): getIbPlanSubscriptionForm(), fieldErrors(), findForm(), IbSubscriptionFormDialog(), handleSubmit(), inputNodes(), Props

### Community 88 - "client-analytics-risk-drawdown-panel.tsx"
Cohesion: 0.20
Nodes (14): ClientAnalyticsRiskDrawdownPanel(), ClientAnalyticsRiskDrawdownPanelProps, formatCurrency(), formatDays(), formatNumber(), formatPercent(), formatSignedCurrency(), MetricRow() (+6 more)

### Community 89 - "browser-client.ts"
Cohesion: 0.16
Nodes (14): BrowserBrokerRequestOptions, buildSearch(), serializeSearchParamValue(), BrokerApiError, browserIamRequest(), BrowserIamRequestOptions, BrokerErrorDetails, extractValidationMessages() (+6 more)

### Community 90 - "trading-servers-view.tsx"
Cohesion: 0.24
Nodes (8): geistMono, geistSans, metadata, Tooltip(), TooltipContent(), TooltipProvider(), TooltipTrigger(), TradingServersViewProps

### Community 91 - "leverage/api.ts"
Cohesion: 0.26
Nodes (13): compactFilters(), createLeverage(), deleteLeverage(), getLeverage(), LeverageAudience, listLeverages(), updateLeverage(), LeverageFormDialog() (+5 more)

### Community 92 - "skeleton.tsx"
Cohesion: 0.08
Nodes (68): ActionTooltipButton(), ActionTooltipButtonProps, PageContentToolbar(), PageContentToolbarProps, Badge(), badgeVariants, Input(), Skeleton() (+60 more)

### Community 93 - "ib-progression-template/api.ts"
Cohesion: 0.15
Nodes (14): createIbProgressionTemplate(), deleteIbProgressionTemplate(), listIbProgressionTemplates(), updateIbProgressionTemplate(), IbProgressionTemplatesView(), handleDelete(), TemplateForm(), handleSubmit() (+6 more)

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
Cohesion: 0.25
Nodes (8): invalidateBonusOfferFormCatalog(), BonusOfferTemplatesView(), clearFilters(), commitFilters(), handleMutationSuccess(), onFilterEnter(), patchDraft(), toggleSort()

### Community 103 - "package.json"
Cohesion: 0.25
Nodes (7): name, pnpm, onlyBuiltDependencies, private, version, sharp, unrs-resolver

### Community 105 - "config-form.ts"
Cohesion: 0.36
Nodes (8): TradingServerFormDialog(), handleSubmit(), loadOptions(), buildEmptyConfig(), configFromTradingServer(), getDefaultSchemaId(), MASKED_SECRET_VALUE, serializeConfigForSubmit()

### Community 106 - "area-switcher.tsx"
Cohesion: 0.43
Nodes (5): AreaSwitcher(), areaTabs, APP_AREAS, AppAreaId, resolveAppArea()

### Community 108 - "IbProgramsView"
Cohesion: 0.22
Nodes (3): IbProgramsView(), ibProgramPaymentRulesPath(), ibProgramSymbolsPath()

### Community 109 - "session-constants.ts"
Cohesion: 0.29
Nodes (8): ADMIN_2FA_COOKIE, ADMIN_SESSION_COOKIE, CLIENT_2FA_COOKIE, CLIENT_SESSION_COOKIE, parseSessionPayload(), config, hasValidSession(), middleware()

### Community 110 - "getBonusOffer"
Cohesion: 0.25
Nodes (8): getBonusOffer(), listBonusOffers(), listEligibleIntroducingBrokers(), toSearchParams(), loadEligibleIbs(), BonusOfferIntroducingBrokersDialog(), loadData(), sortedIdsSignature()

### Community 111 - "bonus-offer-form-dialog.tsx"
Cohesion: 0.11
Nodes (28): createBonusOffer(), syncBonusOfferIntroducingBrokers(), updateBonusOffer(), BONUS_OFFER_FIELD_HELP, BonusOfferFieldLabel(), BonusOfferFieldLabelProps, BonusOfferFormDialog(), handleSubmit() (+20 more)

### Community 112 - "ContestBansDialog"
Cohesion: 0.39
Nodes (9): abbreviateUuid(), ContestBansDialog(), applyFiltersFromDraft(), clearFilters(), commitFilters(), onFilterEnter(), patchDraft(), toggleSort() (+1 more)

### Community 113 - "broker/[...path]/route.ts"
Cohesion: 0.25
Nodes (7): DELETE, GET, handle(), PATCH, POST, PUT, RouteContext

### Community 114 - "initial-amount/format.ts"
Cohesion: 0.11
Nodes (11): formatAccountMoney(), moneyFormatter, parseServerGroupDefaultAmount(), serverGroupNeedsInitialAmount(), syncInitialAmountServerGroups(), InitialAmountServerGroupsDialog(), handleSubmit(), InitialAmountsView() (+3 more)

### Community 115 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 116 - "ib-analytics-view.tsx"
Cohesion: 0.32
Nodes (3): IbAnalyticsView(), IbAnalyticsViewProps, Tab

### Community 117 - "Button"
Cohesion: 0.14
Nodes (13): Button(), buttonVariants, defaultLevels, IbPaymentTemplateFormDialogProps, emptyForm, FormState, getNextSortOrder(), IbPaymentTemplateLevelFormDialog() (+5 more)

### Community 118 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 119 - "risk-metrics-summary-cards.tsx"
Cohesion: 0.36
Nodes (7): formatDeltaPercent(), formatValue(), getMetricLabel(), METRIC_LABELS, MetricCard(), MetricCardProps, RiskMetricsSummaryCardsProps

### Community 120 - "insurance-plan-form-dialog.tsx"
Cohesion: 0.40
Nodes (5): emptyForm, FormState, InsurancePlanFormDialog(), InsurancePlanFormDialogProps, planToForm()

### Community 121 - "browserBrokerRequest"
Cohesion: 0.12
Nodes (25): listPublicContests(), activateContest(), cancelContest(), createContestAward(), updateContestAward(), ContestAwardFormDialog(), handleSubmit(), ContestLifecycleDialog() (+17 more)

### Community 122 - "listServerGroupLeverages"
Cohesion: 0.33
Nodes (5): listServerGroupLeverages(), synchronizeServerGroupLeverages(), ServerGroupLeveragesSyncDialog(), handleSubmit(), loadLeverages()

### Community 123 - "ContestGlobalSettingsView"
Cohesion: 0.29
Nodes (8): getContestGlobalSettings(), mapContestGlobalSettingsResponse(), updateContestGlobalSettings(), withProxyBannerUrl(), ContestGlobalSettingsView(), handleSubmit(), settingsToForm(), parseOptionalInteger()

### Community 126 - "closePosition"
Cohesion: 0.33
Nodes (7): accountPositionsPath(), closePosition(), openPosition(), handleClose(), OpenPositionDialog(), handleSubmit(), resetForm()

### Community 127 - "ib-referrals-content.tsx"
Cohesion: 0.20
Nodes (16): getIbReferralAccounts(), IbAnalyticsAudience, IbAnalyticsFilters, AccountsDialog(), ChildState, date(), flag(), GeoRanking() (+8 more)

### Community 128 - "set-symbols-category-dialog.tsx"
Cohesion: 0.40
Nodes (5): scopeDescription(), handleSubmit(), SetSymbolsCategoryDialogProps, successMessage(), toRequestBody()

### Community 129 - "listBonusNegativeBalanceCompensations"
Cohesion: 0.40
Nodes (5): listBonusNegativeBalanceCompensations(), NegativeBalanceRebalancesDataTable(), applyFilters(), onFilterEnter(), NegativeBalanceRebalancesTable()

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
Cohesion: 0.60
Nodes (4): displayValue(), findForm(), JwfSubmissionReadonly(), ReadonlyNode()

### Community 134 - "handleSubmit"
Cohesion: 0.67
Nodes (3): handleSubmit(), successMessage(), toRequestBody()

### Community 135 - "useIsMobile"
Cohesion: 0.70
Nodes (4): getIsMobileServerSnapshot(), getIsMobileSnapshot(), subscribeToMobileQuery(), useIsMobile()

### Community 139 - "bonus-offer-delete-dialog.tsx"
Cohesion: 0.50
Nodes (3): BonusOfferDeleteDialog(), handleDelete(), BonusOfferDeleteDialogProps

### Community 140 - "ib-plan-form-dialog.tsx"
Cohesion: 0.50
Nodes (3): emptyForm, FormState, IbPlanFormDialogProps

### Community 141 - "ib-plan-subscription-form-dialog.tsx"
Cohesion: 0.50
Nodes (3): emptyForm, FormState, IbPlanSubscriptionFormDialogProps

### Community 145 - "ib-program-form-dialog.tsx"
Cohesion: 0.50
Nodes (3): emptyForm, FormState, IbProgramFormDialogProps

### Community 146 - "insurance-plan-option-form-dialog.tsx"
Cohesion: 0.50
Nodes (3): emptyForm, FormState, InsurancePlanOptionFormDialogProps

### Community 148 - "trading-account-access-dialog.tsx"
Cohesion: 0.50
Nodes (3): ACTION_COPY, RESTRICTING_ACTIONS, TradingAccountAccessDialogProps

### Community 152 - "cancelBonusAssignment"
Cohesion: 0.67
Nodes (3): cancelBonusAssignment(), CancelBonusAssignmentDialog(), submit()

## Knowledge Gaps
- **581 isolated node(s):** `AdminLoginPageProps`, `ClientLoginPageProps`, `AccountMetricsPageProps`, `AccountPositionsPageProps`, `Props` (+576 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatBrokerApiError()` connect `formatBrokerApiError` to `contest/api.ts`, `bonus-assignment-logs-view.tsx`, `ib-program-payment-rules-view.tsx`, `insurance/index.ts`, `client-risk-metrics/api.ts`, `trading-server-groups-view.tsx`, `alert-dialog.tsx`, `scheduled-command-detail-dialog.tsx`, `ib-plan-subscription/index.ts`, `client-trading-accounts-view.tsx`, `client-insurances-view.tsx`, `form-builder-view.tsx`, `ib-admin-analytics-view.tsx`, `trading-server/api.ts`, `bonus-assignment-logs/index.ts`, `client-contest-detail-view.tsx`, `finance-transactions-view.tsx`, `client-ib-progression-panel.tsx`, `forms-view.tsx`, `public-risk-metrics-view.tsx`, `ib-rewards-view.tsx`, `contest-workspace-panels.tsx`, `trading-server/format.ts`, `IbPlanProgramsSyncView`, `risk-control-view.tsx`, `client-bonuses-view.tsx`, `rejection-reason-composer.tsx`, `trading-accounts-view.tsx`, `client-positions-panel.tsx`, `client-analytics-behavior-panel.tsx`, `position-commission-rewards-dialog.tsx`, `card.tsx`, `ib-volume-reward-trades-report-view.tsx`, `client-analytics-profitability-panel.tsx`, `IbProgramSymbolsView`, `ib-reward-logs/index.ts`, `forms-list-view.tsx`, `ib-plan/api.ts`, `bonus-offer-template/api.ts`, `trading-migration/api.ts`, `BonusAssignmentLogsView`, `ib-earnings-content.tsx`, `initial-amount/api.ts`, `configuration/api.ts`, `client-analytics-dashboard-panel.tsx`, `BonusOffersView`, `ib-program/api.ts`, `FormBuilderView`, `button.tsx`, `positions-report-view.tsx`, `server-group-edit-sheet.tsx`, `client-analytics-symbol-panel.tsx`, `symbol-category-delete-dialog.tsx`, `ib-admin-analytics/api.ts`, `PlatformsView`, `broker-response.ts`, `IbPlanSubscriptionsView`, `position-history-view.tsx`, `client-bonus/api.ts`, `contest-general-form.tsx`, `TradingServerGroupsView`, `listServerGroupsForAdmin`, `ContestSubscriptionsView`, `contest-workspace-view.tsx`, `errors.ts`, `subscriptionStatusLabel`, `api-error-alert.tsx`, `ib-subscription-form-dialog.tsx`, `client-analytics-risk-drawdown-panel.tsx`, `browser-client.ts`, `trading-servers-view.tsx`, `leverage/api.ts`, `skeleton.tsx`, `ib-progression-template/api.ts`, `IbPaymentTemplatesView`, `ib-partner-tier-panel.tsx`, `ContestAwardsView`, `ContestConditionsView`, `IbPlansView`, `BonusOfferAdminAssignDialog`, `RiskMetricsShareDialog`, `BonusOfferTemplatesView`, `RejectionTemplatesView`, `config-form.ts`, `ClientTradingAccountsView`, `IbProgramsView`, `getBonusOffer`, `bonus-offer-form-dialog.tsx`, `ContestBansDialog`, `initial-amount/format.ts`, `Button`, `insurance-plan-form-dialog.tsx`, `browserBrokerRequest`, `listServerGroupLeverages`, `ContestGlobalSettingsView`, `LeveragesView`, `closePosition`, `ib-referrals-content.tsx`, `set-symbols-category-dialog.tsx`, `listBonusNegativeBalanceCompensations`, `bonus-offer-admin-assign-dialog.tsx`, `handleSubmit`, `BonusOfferServerGroupsDialog`, `bonus-offer-delete-dialog.tsx`, `ib-plan-form-dialog.tsx`, `ib-plan-subscription-form-dialog.tsx`, `ib-program-form-dialog.tsx`, `insurance-plan-option-form-dialog.tsx`, `trading-account-access-dialog.tsx`, `cancelBonusAssignment`?**
  _High betweenness centrality (0.244) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `bonus-assignment-logs-view.tsx`, `plan-programs-dnd.ts`, `ib-program-payment-rules-view.tsx`, `insurance/index.ts`, `client-risk-metrics/api.ts`, `trading-server-groups-view.tsx`, `alert-dialog.tsx`, `scheduled-command-detail-dialog.tsx`, `client-insurances-view.tsx`, `form-builder-view.tsx`, `ib-admin-analytics-view.tsx`, `ib-plan-form-dialog.tsx`, `ib-plan-subscription-form-dialog.tsx`, `ib-program-form-dialog.tsx`, `client-ib-progression-panel.tsx`, `forms-view.tsx`, `ib-rewards-view.tsx`, `IbPlanProgramsSyncView`, `rejection-reason-composer.tsx`, `trading-accounts-view.tsx`, `client-analytics-behavior-panel.tsx`, `card.tsx`, `ib-volume-reward-trades-report-view.tsx`, `client-analytics-profitability-panel.tsx`, `IbProgramSymbolsView`, `ib-reward-logs/index.ts`, `client-risk-metrics-view.tsx`, `ib-plan/api.ts`, `trading-migration/api.ts`, `BonusAssignmentLogsView`, `ib-earnings-content.tsx`, `client-analytics-dashboard-panel.tsx`, `FormBuilderView`, `button.tsx`, `positions-report-view.tsx`, `server-group-edit-sheet.tsx`, `client-analytics-symbol-panel.tsx`, `ib-admin-analytics/api.ts`, `listServerGroupsForAdmin`, `contest-workspace-view.tsx`, `errors.ts`, `api-error-alert.tsx`, `client-analytics-risk-drawdown-panel.tsx`, `trading-servers-view.tsx`, `skeleton.tsx`, `area-switcher.tsx`, `IbProgramsView`, `ContestBansDialog`, `Button`, `insurance-plan-form-dialog.tsx`, `ContestGlobalSettingsView`, `ib-referrals-content.tsx`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `browserBrokerRequest()` connect `browserBrokerRequest` to `contest/api.ts`, `listBonusNegativeBalanceCompensations`, `ib-program-payment-rules-view.tsx`, `insurance/index.ts`, `client-risk-metrics/api.ts`, `trading-server-groups-view.tsx`, `scheduled-command-detail-dialog.tsx`, `ib-plan-subscription/index.ts`, `client-trading-accounts-view.tsx`, `client-insurances-view.tsx`, `form-builder-view.tsx`, `trading-server/api.ts`, `bonus-assignment-logs/index.ts`, `client-contest-detail-view.tsx`, `finance-transactions-view.tsx`, `client-ib-progression-panel.tsx`, `forms-view.tsx`, `formatBrokerApiError`, `public-risk-metrics-view.tsx`, `cancelBonusAssignment`, `ib-rewards-view.tsx`, `contest-workspace-panels.tsx`, `bonus-offer/api.ts`, `risk-control-view.tsx`, `client-bonuses-view.tsx`, `rejection-reason-composer.tsx`, `trading-accounts-view.tsx`, `client-positions-panel.tsx`, `client-analytics-behavior-panel.tsx`, `position-commission-rewards-dialog.tsx`, `ib-volume-reward-trades-report-view.tsx`, `IbProgramSymbolsView`, `ib-reward-logs/index.ts`, `forms-list-view.tsx`, `ib-plan/api.ts`, `bonus-offer-template/api.ts`, `trading-migration/api.ts`, `initial-amount/api.ts`, `configuration/api.ts`, `use-account-positions-channel.ts`, `ib-program/api.ts`, `FormBuilderView`, `positions-report-view.tsx`, `client-analytics-symbol-panel.tsx`, `symbol-category-delete-dialog.tsx`, `ib-admin-analytics/api.ts`, `client-positions/api.ts`, `position-history-view.tsx`, `client-bonus/api.ts`, `contest-general-form.tsx`, `listServerGroupsForAdmin`, `ContestSubscriptionsView`, `contest-workspace-view.tsx`, `ib-subscription-form-dialog.tsx`, `browser-client.ts`, `leverage/api.ts`, `ib-progression-template/api.ts`, `ib-partner-tier-panel.tsx`, `RiskMetricsShareDialog`, `getBonusOffer`, `bonus-offer-form-dialog.tsx`, `initial-amount/format.ts`, `listServerGroupLeverages`, `closePosition`, `ib-referrals-content.tsx`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **What connects `AdminLoginPageProps`, `ClientLoginPageProps`, `AccountMetricsPageProps` to the rest of the system?**
  _581 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `contest/api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0889894419306184 - nodes in this community are weakly interconnected._
- **Should `ib-program-payment-rules-view.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06990622335890878 - nodes in this community are weakly interconnected._
- **Should `insurance/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05087719298245614 - nodes in this community are weakly interconnected._