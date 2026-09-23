# Graph Report - mmt-broker-basic-ui  (2026-09-23)

## Corpus Check
- 450 files · ~189,596 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3276 nodes · 12170 edges · 159 communities (126 shown, 33 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0b6a11bc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- contest/api.ts
- api-error-alert.tsx
- ib-program-payment-rule-form-dialog.tsx
- insurance/index.ts
- cn
- client-risk-metrics/api.ts
- TradingServerSecuritySymbolsView
- alert-dialog.tsx
- scheduled-command-run-dialog.tsx
- ib-plan-subscription/index.ts
- ib-payment-template/api.ts
- listIbPaymentTemplates
- form-builder-view.tsx
- ib-admin-analytics-view.tsx
- trading-server/api.ts
- bonus-assignment-logs/index.ts
- client-contest-detail-view.tsx
- ib-volume-reward-trades-report-view.tsx
- client-ib-progression-panel.tsx
- forms-view.tsx
- formatBrokerApiError
- public-risk-metrics-view.tsx
- client-risk-metrics/types.ts
- form-document.ts
- broker-client.ts
- ib-reward/index.ts
- contest-workspace-panels.tsx
- bonus-offer/api.ts
- trading-server/format.ts
- ib-plan-programs-sync-view.tsx
- risk-control/api.ts
- client-bonus-assignment-detail-dialog.tsx
- bonus-offer-delete-dialog.tsx
- trading-accounts-view.tsx
- bonus-assignment-logs-view.tsx
- client-analytics-behavior-panel.tsx
- ib-volume-reward-trades/types.ts
- card.tsx
- [securityId]/symbols/page.tsx
- client-analytics-profitability-panel.tsx
- ib-program-symbols-view.tsx
- ib-reward-logs/index.ts
- compilerOptions
- client-insurance/api.ts
- client-risk-metrics-view.tsx
- ib-plan/api.ts
- platform/api.ts
- site-header.tsx
- bonus-offer-template-form-dialog.tsx
- TradingMigrationsView
- bonus-offers-view.tsx
- EarningsRow
- readSession
- initial-amount/api.ts
- configuration/api.ts
- client-analytics-dashboard-panel.tsx
- components.json
- SiteHeader
- use-account-positions-channel.ts
- auth.ts
- ib-program/api.ts
- client-ib/format.ts
- bonus-offer-server-groups-dialog.tsx
- ScheduledCommandsView
- server-group-edit-sheet.tsx
- devDependencies
- dependencies
- client-analytics-symbol-panel.tsx
- symbol-category/api.ts
- ib-admin-analytics/api.ts
- PlatformsView
- client-analytics-risk-drawdown-panel.tsx
- IbPlanSubscriptionsView
- BonusAssignmentLogsView
- PositionHistoryView
- ContestSubscriptionsView
- client-bonus/api.ts
- ib-admin-analytics/types.ts
- contest-general-form.tsx
- ib-program-payment-rules-view.tsx
- bonus-excluded-instruments-view.tsx
- forms/types.ts
- IbPaymentTemplateFormDialog
- PositionsReportView
- client-trading-account-create-dialog.tsx
- errors.ts
- [tradingServerId]/symbols/page.tsx
- contest-workspace-view.tsx
- ContestBansDialog
- browser-client.ts
- positions/api.ts
- leverage/api.ts
- table.tsx
- ib-progression-template/api.ts
- session.server.ts
- broker/[...path]/route.ts
- ContestAwardsView
- ContestConditionsView
- IbPlansView
- IB Admin Analytics
- bonus-offer-admin-assign-dialog.tsx
- RiskMetricsShareDialog
- use-trading-stream-positions-channel.ts
- package.json
- trading-migration/api.ts
- config-form.ts
- app-area-bar.tsx
- NegativeBalanceRebalancesDataTable
- IbProgramsView
- FormsListView
- metrics/page.tsx
- bonus-offer-form-dialog.tsx
- ib-analytics-view.tsx
- client-positions/api.ts
- new/page.tsx
- scripts
- FormBuilderView
- apply-position-snapshot.ts
- README.md
- programs/page.tsx
- subscriptions/page.tsx
- browserBrokerRequest
- trading-servers/page.tsx
- [tradingServerId]/securities/page.tsx
- [serverGroupId]/securities/page.tsx
- LeveragesView
- IbReferralsContent
- position-history/api.ts
- ContestGlobalSettingsView
- RejectionTemplatesView
- IbVolumeRewardTradesReportView
- class-variance-authority
- account-insurance-claim-dialogs.tsx
- IbPaymentTemplateLevelFormDialog
- TradingServersView
- eslint.config.mjs
- TradingSecuritiesView
- TradingSymbolsView
- ib-progression-templates/page.tsx
- laravel-echo
- next.config.ts
- pusher-js
- FormElementEditorSheet
- react-dom
- postcss.config.mjs
- IbPaymentTemplateLevelsDialog
- accounts/[accountId]/risk-control/page.tsx
- trading-accounts/[accountId]/risk-control/page.tsx
- OpenPositionDialog
- InsurancePlanServerGroupsDialog
- CredentialValue
- react

## God Nodes (most connected - your core abstractions)
1. `formatBrokerApiError()` - 379 edges
2. `browserBrokerRequest()` - 277 edges
3. `cn()` - 236 edges
4. `ApiErrorAlert()` - 149 edges
5. `Button()` - 137 edges
6. `Skeleton()` - 98 edges
7. `Label()` - 89 edges
8. `Input()` - 83 edges
9. `DialogContent()` - 68 edges
10. `DialogHeader()` - 68 edges

## Surprising Connections (you probably didn't know these)
- `handle()` --calls--> `proxyBrokerRequest()`  [EXTRACTED]
  app/api/broker/[...path]/route.ts → lib/api/broker-client.ts
- `BreadcrumbEllipsis()` --calls--> `cn()`  [EXTRACTED]
  components/ui/breadcrumb.tsx → lib/utils.ts
- `CardAction()` --calls--> `cn()`  [EXTRACTED]
  components/ui/card.tsx → lib/utils.ts
- `DropdownMenuLabel()` --calls--> `cn()`  [EXTRACTED]
  components/ui/dropdown-menu.tsx → lib/utils.ts
- `SheetOverlay()` --calls--> `cn()`  [EXTRACTED]
  components/ui/sheet.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (159 total, 33 thin omitted)

### Community 0 - "contest/api.ts"
Cohesion: 0.09
Nodes (47): buildServerGroupLabel(), deleteContest(), deleteContestAward(), deleteContestCondition(), invalidateContestFormCatalog(), listEligibleIntroducingBrokers(), loadContestFormCatalog(), resolveServerGroupCurrency() (+39 more)

### Community 1 - "api-error-alert.tsx"
Cohesion: 0.08
Nodes (69): ActionTooltipButton(), ActionTooltipButtonProps, ApiErrorAlertProps, PageContentToolbar(), PageContentToolbarProps, Alert(), AlertDescription(), AlertTitle() (+61 more)

### Community 2 - "ib-program-payment-rule-form-dialog.tsx"
Cohesion: 0.18
Nodes (23): createIbProgramCpaRule(), createIbProgramPnlRule(), createIbProgramVolumeRule(), ibProgramPath(), updateIbProgramCpaRule(), updateIbProgramPnlRule(), updateIbProgramVolumeRule(), emptyForm (+15 more)

### Community 3 - "insurance/index.ts"
Cohesion: 0.06
Nodes (57): approveAccountInsuranceClaim(), compactFilters(), createInsurancePlan(), createInsurancePlanOption(), deleteInsurancePlan(), deleteInsurancePlanOption(), getInsurancePlan(), listAccountInsurancesAdmin() (+49 more)

### Community 4 - "cn"
Cohesion: 0.05
Nodes (60): geistMono, geistSans, metadata, bonusNavigation, contestsNavigation, ibNavigation, insuranceNavigation, reportsNavigation (+52 more)

### Community 5 - "client-risk-metrics/api.ts"
Cohesion: 0.08
Nodes (43): analyticsOverviewInflight, analyticsOverviewRequestKey(), getAccountAnalyticsDrawdowns(), getAccountAnalyticsDurationScatter(), getAccountAnalyticsEquityCurve(), getAccountAnalyticsOverview(), getAccountAnalyticsPnlDistribution(), getAccountAnalyticsProfitability() (+35 more)

### Community 6 - "TradingServerSecuritySymbolsView"
Cohesion: 0.33
Nodes (3): formToAppliedFilters(), TradingServerSecuritySymbolsView(), applyFilters()

### Community 7 - "alert-dialog.tsx"
Cohesion: 0.14
Nodes (34): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogTitle() (+26 more)

### Community 8 - "scheduled-command-run-dialog.tsx"
Cohesion: 0.13
Nodes (32): buildListSearchParams(), cancelScheduledCommandRun(), getScheduledCommand(), listScheduledCommands(), runScheduledCommand(), updateScheduledCommand(), ScheduledCommandFormDialog(), handleSubmit() (+24 more)

### Community 9 - "ib-plan-subscription/index.ts"
Cohesion: 0.11
Nodes (38): adminSubscriptionsPath(), createIbPlanSubscription(), getIbPlanSubscriptionFormSubmission(), listIbPlanSubscriptionAdminInteractions(), listIbPlanSubscriptions(), toSearchParams(), updateIbPlanSubscription(), updateIbPlanSubscriptionParameters() (+30 more)

### Community 10 - "ib-payment-template/api.ts"
Cohesion: 0.23
Nodes (16): createIbPaymentTemplate(), createIbPaymentTemplateLevel(), deleteIbPaymentTemplate(), deleteIbPaymentTemplateLevel(), updateIbPaymentTemplateLevel(), handleSubmit(), handleSubmit(), formatPaymentTemplateRate() (+8 more)

### Community 11 - "listIbPaymentTemplates"
Cohesion: 0.29
Nodes (3): listIbPaymentTemplates(), IbPaymentTemplatesView(), summarizeLevels()

### Community 12 - "form-builder-view.tsx"
Cohesion: 0.26
Nodes (11): DashboardBreadcrumbs(), DashboardBreadcrumbsProps, Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage() (+3 more)

### Community 13 - "ib-admin-analytics-view.tsx"
Cohesion: 0.14
Nodes (21): AnalyticsKpis(), AnalyticsSeriesChart(), AnalyticsTab, availabilityReason(), CATEGORY_COLORS, CategoryDistribution(), ClientFunnel(), CommissionBySource() (+13 more)

### Community 14 - "trading-server/api.ts"
Cohesion: 0.09
Nodes (45): cachedEnvironmentsByAudience, configSchemasByPlatform, configSchemasDeniedPlatforms, deleteTradingServer(), getTradingServer(), getTradingServerForAdmin(), listCatalogServerGroupLeverages(), listSecurities() (+37 more)

### Community 15 - "bonus-assignment-logs/index.ts"
Cohesion: 0.11
Nodes (32): cancelBonusAssignment(), compactFilters(), getBonusAssignment(), listBonusAssignments(), listBonusNegativeBalanceCompensations(), listDepositBonusIntents(), loadAssignment(), CancelBonusAssignmentDialog() (+24 more)

### Community 16 - "client-contest-detail-view.tsx"
Cohesion: 0.08
Nodes (44): ClientContestDetailPageProps, ClientContestsPage(), compactFilters(), getContestBannerUrl(), getContestLeaderboardTop(), getContestSubscription(), getPublicContest(), getPublicContestGlobalSettings() (+36 more)

### Community 17 - "ib-volume-reward-trades-report-view.tsx"
Cohesion: 0.09
Nodes (43): buildPageItems(), PageNumberPagination(), subscribeToHydration(), paymentStatusLabel(), paymentStatusVariant(), getIbVolumeRewardTradeRewards(), DEFAULT_FILTERS, EMPTY_DRAFT (+35 more)

### Community 18 - "client-ib-progression-panel.tsx"
Cohesion: 0.11
Nodes (31): compactFilters(), getActiveIbPlanContext(), getIbPlanSubscriptionForm(), getMyIbPlanSubscription(), listClientIbPlans(), listMyIbPlanProgressionLogs(), subscribeToIbPlan(), withProxyClientPlan() (+23 more)

### Community 19 - "forms-view.tsx"
Cohesion: 0.13
Nodes (21): archiveFormVersion(), createForm(), deleteForm(), getForm(), getFormVersion(), listForms(), archive(), remove() (+13 more)

### Community 20 - "formatBrokerApiError"
Cohesion: 0.05
Nodes (45): BonusOfferTemplateDeleteDialog(), handleDelete(), ContestAwardDeleteDialog(), handleDelete(), ContestConditionDeleteDialog(), handleDelete(), ContestDeleteDialog(), handleDelete() (+37 more)

### Community 21 - "public-risk-metrics-view.tsx"
Cohesion: 0.08
Nodes (25): PublicRiskMetricsPageProps, getPublicRiskMetricsSummary(), applyLiveEquityChange(), applyRiskMetricChanges(), parseMetricJsonValue(), toUnixSecond(), toUtcDateKey(), PublicAnalyticsOverviewView() (+17 more)

### Community 22 - "client-risk-metrics/types.ts"
Cohesion: 0.05
Nodes (38): AnalyticsCumulativePnl, AnalyticsDailyDayBehavior, AnalyticsDailyStats, AnalyticsDailyStreakSegment, AnalyticsDailyTradeRow, AnalyticsDailyTransitionMatrix, AnalyticsDurationScatterPoint, AnalyticsEquityCurvePoint (+30 more)

### Community 23 - "form-document.ts"
Cohesion: 0.18
Nodes (22): addFormElement(), collectInputNames(), containerPath(), containsNode(), editableForm(), findFormElement(), findNode(), findNodeLocation() (+14 more)

### Community 24 - "broker-client.ts"
Cohesion: 0.12
Nodes (24): buildIamUpstreamUrl(), DELETE, GET, handle(), PATCH, POST, PUT, RouteContext (+16 more)

### Community 25 - "ib-reward/index.ts"
Cohesion: 0.09
Nodes (32): getIbAnalyticsMonthly(), getIbAnalyticsSummary(), getIbAnalyticsYtd(), listIbAnalyticsRewards(), path(), toSearchParams(), IbAnalyticsView(), money() (+24 more)

### Community 26 - "contest-workspace-panels.tsx"
Cohesion: 0.11
Nodes (30): assignContestAward(), assignContestCondition(), listAssignedContestAwards(), listAssignedContestConditions(), listContestAwards(), listContestBans(), listContestConditions(), revertContestBan() (+22 more)

### Community 27 - "bonus-offer/api.ts"
Cohesion: 0.11
Nodes (38): adminAssignBonus(), createBonusOffer(), deleteBonusOffer(), invalidateBonusOfferFormCatalog(), listBonusOffers(), listBonusOfferTemplates(), listEligibleAccountsForBonusOfferAdmin(), loadBonusOfferFormCatalog() (+30 more)

### Community 28 - "trading-server/format.ts"
Cohesion: 0.07
Nodes (30): applyFilters(), parseMajorAmountToMinorUnits(), updateServerGroup(), emptyCountryRow(), ServerGroupEditSheet(), handleSubmit(), formToAppliedFilters(), TradingServerGroupsView() (+22 more)

### Community 29 - "ib-plan-programs-sync-view.tsx"
Cohesion: 0.12
Nodes (31): syncIbPlanPrograms(), IbPlanProgramPivotFormDialog(), handleSubmit(), AvailableProgramItem(), handleDragStart(), formatProgressionMaxVolume(), IbPlanProgramsSyncView(), handleAssignedDrop() (+23 more)

### Community 30 - "risk-control/api.ts"
Cohesion: 0.15
Nodes (20): archiveRiskControlRule(), listRiskControlExecutions(), listRiskControlRules(), loadRiskControlCatalog(), prefix(), formatDate(), RiskControlView(), archiveSelected() (+12 more)

### Community 31 - "client-bonus-assignment-detail-dialog.tsx"
Cohesion: 0.17
Nodes (23): getClientBonusAssignment(), ClientBonusAssignmentDetailDialog(), loadAssignment(), ClientBonusAssignmentDetailDialogProps, ClientBonusClaimDialog(), ClientBonusesView(), assignmentOfferName(), assignmentOfferType() (+15 more)

### Community 32 - "bonus-offer-delete-dialog.tsx"
Cohesion: 0.16
Nodes (23): BonusOfferDeleteDialogProps, ContestSubscriptionBanDialogProps, compactFilters(), createRejectionTemplate(), deleteRejectionTemplate(), getRejectionTemplate(), listRejectionTemplates(), updateRejectionTemplate() (+15 more)

### Community 33 - "trading-accounts-view.tsx"
Cohesion: 0.05
Nodes (57): DropdownMenu(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuSeparator(), DropdownMenuTrigger(), TableFooter(), ListTradingAccountPositionsParams (+49 more)

### Community 34 - "bonus-assignment-logs-view.tsx"
Cohesion: 0.24
Nodes (20): BonusAssignmentDetailDialog(), BonusAssignmentDetailDialogProps, abbreviateUuid(), AssignmentsTable(), breadcrumbs, ColumnSortHeadProps, DepositIntentsTable(), logsTabs (+12 more)

### Community 35 - "client-analytics-behavior-panel.tsx"
Cohesion: 0.10
Nodes (27): getAccountAnalyticsBehavior(), getAccountAnalyticsDaily(), getAccountAnalyticsDailyDayTrades(), buildCalendarGrid(), CalendarMonthView(), CalendarViewMode, CalendarYearView(), ClientAnalyticsBehaviorPanel() (+19 more)

### Community 36 - "ib-volume-reward-trades/types.ts"
Cohesion: 0.14
Nodes (15): CalculationAvailability, IbVolumeDirectReward, IbVolumeRewardLine, IbVolumeRewardRatioBucket, IbVolumeRewardTradeDetail, IbVolumeRewardTradeFilters, IbVolumeRewardTradesMeta, IbVolumeRewardTradeSort (+7 more)

### Community 37 - "card.tsx"
Cohesion: 0.13
Nodes (24): ClientHomePage(), DashboardPage(), BrokerRequestCredentials(), Card(), CardAction(), CardContent(), CardDescription(), CardFooter() (+16 more)

### Community 39 - "client-analytics-profitability-panel.tsx"
Cohesion: 0.11
Nodes (19): AnalyticsPanelCard(), BreakEvenGauge(), ClientAnalyticsProfitabilityPanel(), ClientAnalyticsProfitabilityPanelProps, CumulativeGranularity, DirectionBreakdown(), ExpectancyContributionBar(), formatCurrency() (+11 more)

### Community 40 - "ib-program-symbols-view.tsx"
Cohesion: 0.11
Nodes (26): ibProgramPath(), listAllIbProgramSymbols(), listIbProgramSymbols(), syncIbProgramSymbols(), IbProgramSymbolConfigSheet(), IbProgramSymbolsView(), handleAddSymbol(), handleSave() (+18 more)

### Community 41 - "ib-reward-logs/index.ts"
Cohesion: 0.16
Nodes (17): compactFilters(), listIbRewardSettlementRuns(), listIbTradingAccountPeriodSnapshots(), IbRewardLogsView(), isRewardLogTab(), truncateId(), formatDateTimeValue(), formatMoneyValue() (+9 more)

### Community 42 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 43 - "client-insurance/api.ts"
Cohesion: 0.09
Nodes (38): cancelClientAccountInsurance(), claimClientAccountInsurance(), compactFilters(), contractClientAccountInsurance(), isInsuranceCandidateAccount(), listClientAccountInsurances(), listInsurancePlansForAccount(), loadAccountsWithInProgressInsurance() (+30 more)

### Community 44 - "client-risk-metrics-view.tsx"
Cohesion: 0.10
Nodes (20): ANALYTICS_TABS, AnalyticsTab, applyAnalyticsUpdate(), applyDashboardMetrics(), applyPhaseMetricsUpdate(), ClientRiskMetricsView(), ClientRiskMetricsViewProps, DATE_RANGE_OPTIONS (+12 more)

### Community 45 - "ib-plan/api.ts"
Cohesion: 0.14
Nodes (28): appendIbPlanFormData(), createIbPlan(), deleteIbPlan(), listIbPlanPrograms(), listIbPlans(), mapIbPlanResponse(), mapIbPlansResponse(), seedIbDemoCatalog() (+20 more)

### Community 46 - "platform/api.ts"
Cohesion: 0.17
Nodes (20): appendPlatformFormData(), createPlatform(), deletePlatform(), getPlatform(), listAvailablePlatforms(), listConfiguredPlatforms(), listPlatforms(), mapPlatformResponse() (+12 more)

### Community 48 - "bonus-offer-template-form-dialog.tsx"
Cohesion: 0.14
Nodes (28): BonusOfferFieldLabel(), createBonusOfferTemplate(), deleteBonusOfferTemplate(), getBonusOfferTemplate(), listBonusOfferTemplates(), syncBonusOfferTemplateExcludedInstruments(), toSearchParams(), updateBonusOfferTemplate() (+20 more)

### Community 49 - "TradingMigrationsView"
Cohesion: 0.16
Nodes (8): getMigrationRun(), listMigrationAccounts(), listMigrationRuns(), formatDate(), labelForStatus(), RunDetailsDialog(), statusVariant(), TradingMigrationsView()

### Community 50 - "bonus-offers-view.tsx"
Cohesion: 0.07
Nodes (26): bonusOfferExcludedInstrumentsPath(), bonusOfferTemplateExcludedInstrumentsPath(), BonusOfferDeleteDialog(), handleDelete(), bonusOffersBreadcrumbs, BonusOffersView(), clearFilters(), commitFilters() (+18 more)

### Community 51 - "EarningsRow"
Cohesion: 0.25
Nodes (8): EarningsCards(), EarningsRow(), formatDate(), formatMoney(), IbEarningsContent(), rateLabel(), tradeCell(), typeLabel()

### Community 52 - "readSession"
Cohesion: 0.26
Nodes (12): AdminLoginPage(), AdminLoginPageProps, ClientLoginPage(), ClientLoginPageProps, LogoutButton(), loginHref(), resolveAuthArea(), SessionStatus() (+4 more)

### Community 53 - "initial-amount/api.ts"
Cohesion: 0.11
Nodes (13): compactFilters(), getInitialAmount(), listInitialAmounts(), syncInitialAmountServerGroups(), InitialAmountServerGroupsDialog(), handleSubmit(), InitialAmountsView(), CreateInitialAmountInput (+5 more)

### Community 54 - "configuration/api.ts"
Cohesion: 0.17
Nodes (15): listConfigs(), updateConfigsBatch(), ConfigurationView(), handleSave(), CATEGORY_LABELS, categoryLabel(), displayValueForForm(), groupConfigsByCategory() (+7 more)

### Community 55 - "client-analytics-dashboard-panel.tsx"
Cohesion: 0.14
Nodes (21): AnalyticsDashboardSnapshot, ChartToggleChip(), ClientAnalyticsDashboardPanel(), ClientAnalyticsDashboardPanelProps, formatCurrency(), formatMetric(), formatNumber(), formatPercent() (+13 more)

### Community 56 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 58 - "use-account-positions-channel.ts"
Cohesion: 0.16
Nodes (16): accountWatchPath(), heartbeatOpenPositionsWatch(), unwatchOpenPositions(), watchOpenPositions(), PositionsLiveStatus, useAccountPositionsChannel(), UseAccountPositionsChannelOptions, accountPositionsPrivateChannel() (+8 more)

### Community 59 - "auth.ts"
Cohesion: 0.14
Nodes (26): iamForwardHeaders(), LOGIN_PATH, loginAction(), logoutAction(), parseArea(), formAction(), LoginForm(), LoginFormProps (+18 more)

### Community 60 - "ib-program/api.ts"
Cohesion: 0.20
Nodes (16): appendIbProgramFormData(), createIbProgram(), deleteIbProgram(), listIbPrograms(), mapIbProgramResponse(), mapIbProgramsResponse(), updateIbProgram(), withProxyImagePath() (+8 more)

### Community 61 - "client-ib/format.ts"
Cohesion: 0.16
Nodes (13): ClientIbPlanCard(), handleSubscribe(), clientIbPlanSubscriptionTypeLabel(), clientIbSubscriptionStatusLabel(), CLIENT_IB_PLAN_SUBSCRIPTION_TYPE_LABELS, IbPlanProgressionDirection, adminLabel(), IbPlanSubscriptionAdminInteractionsDialog() (+5 more)

### Community 62 - "bonus-offer-server-groups-dialog.tsx"
Cohesion: 0.27
Nodes (11): getBonusOffer(), toServerGroupOption(), BonusOfferServerGroupsDialog(), handleSubmit(), loadData(), BonusOfferServerGroupsDialogProps, ServerGroupOption, toServerGroupOption() (+3 more)

### Community 63 - "ScheduledCommandsView"
Cohesion: 0.15
Nodes (9): hasActiveScheduledCommandRun(), formatDateTime(), runStatusVariant(), ScheduledCommandDetailDialog(), handleCancel(), formatDateTime(), ScheduledCommandsView(), openRunDialog() (+1 more)

### Community 64 - "server-group-edit-sheet.tsx"
Cohesion: 0.25
Nodes (10): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle(), FormElementEditorSheetProps (+2 more)

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
Cohesion: 0.22
Nodes (12): compactFilters(), createSymbolCategory(), deleteSymbolCategory(), listAllSymbolCategories(), listSymbolCategories(), updateSymbolCategory(), SymbolCategoriesView(), handleSubmit() (+4 more)

### Community 69 - "ib-admin-analytics/api.ts"
Cohesion: 0.10
Nodes (23): earningsSearchParams(), getIbAnalytics(), getIbAnalyticsOverview(), getIbEarnings(), getIbEarningsDailyTrades(), getIbReferralsGeo(), IbAnalyticsFilters, IbAnalyticsOverviewFilters (+15 more)

### Community 71 - "client-analytics-risk-drawdown-panel.tsx"
Cohesion: 0.20
Nodes (14): ClientAnalyticsRiskDrawdownPanel(), ClientAnalyticsRiskDrawdownPanelProps, formatCurrency(), formatDays(), formatNumber(), formatPercent(), formatSignedCurrency(), MetricRow() (+6 more)

### Community 72 - "IbPlanSubscriptionsView"
Cohesion: 0.15
Nodes (8): abbreviateUuid(), formToAppliedFilters(), IbPlanSubscriptionsView(), applyFiltersFromDraft(), clearFilters(), commitFilters(), onFilterEnter(), parseOptionalNumber()

### Community 73 - "BonusAssignmentLogsView"
Cohesion: 0.19
Nodes (13): assignmentFormToFilters(), BonusAssignmentLogsView(), clearFilters(), commitAssignmentFilters(), commitIntentFilters(), onAssignmentFilterEnter(), onIntentFilterEnter(), patchAssignmentDraft() (+5 more)

### Community 74 - "PositionHistoryView"
Cohesion: 0.25
Nodes (5): listGlobalPositions(), fromSearch(), historyTab(), PositionHistoryView(), apply()

### Community 75 - "ContestSubscriptionsView"
Cohesion: 0.14
Nodes (17): listContestParticipants(), listContests(), storeContestBan(), toSearchParams(), ContestSubscriptionBanDialog(), handleBan(), abbreviateUuid(), ContestSubscriptionsView() (+9 more)

### Community 76 - "client-bonus/api.ts"
Cohesion: 0.15
Nodes (15): BonusAssignment, claimBonusOffer(), compactFilters(), listAvailableBonusOffers(), listClientBonusAssignments(), listEligibleAccountsForBonusOffer(), handleSubmit(), loadAccounts() (+7 more)

### Community 77 - "ib-admin-analytics/types.ts"
Cohesion: 0.09
Nodes (21): IB_EARNINGS_PAYMENT_STATUSES, IB_EARNINGS_TYPES, IbAnalyticsAvailability, IbAnalyticsCountry, IbAnalyticsHistoricalRule, IbAnalyticsMetricGroup, IbAnalyticsMoney, IbAnalyticsMoneyAvailability (+13 more)

### Community 78 - "contest-general-form.tsx"
Cohesion: 0.23
Nodes (13): createContest(), updateContest(), amountStep(), ContestGeneralForm(), handleSubmit(), ContestGeneralFormProps, contestToForm(), emptyForm (+5 more)

### Community 79 - "ib-program-payment-rules-view.tsx"
Cohesion: 0.15
Nodes (13): listIbProgramCpaRules(), listIbProgramPnlRules(), listIbProgramVolumeRules(), IbProgramPaymentRuleFormDialog(), ruleTypeLabel(), ibProgramPaymentRulesBreadcrumbs, IbProgramPaymentRulesView(), renderRuleDetails() (+5 more)

### Community 80 - "bonus-excluded-instruments-view.tsx"
Cohesion: 0.13
Nodes (15): BonusExcludedInstrumentsView(), handleAddSymbol(), handleSave(), BonusExcludedInstrumentsViewProps, ExcludedInstrumentDraft, draftsSignature(), draftToSyncInput(), excludedInstrumentFromApi() (+7 more)

### Community 81 - "forms/types.ts"
Cohesion: 0.18
Nodes (11): InputPreview(), JwfFormPreview(), JwfFormPreviewProps, stringAttribute(), FORM_INPUT_TYPES, FormListFilters, FormState, JwfDocument (+3 more)

### Community 82 - "IbPaymentTemplateFormDialog"
Cohesion: 0.50
Nodes (3): createLevelDraft(), IbPaymentTemplateFormDialog(), addLevel()

### Community 83 - "PositionsReportView"
Cohesion: 0.20
Nodes (6): activeCount(), datetimeInput(), fromSearch(), PositionsReportView(), apply(), onEnter()

### Community 84 - "client-trading-account-create-dialog.tsx"
Cohesion: 0.07
Nodes (34): createClientTradingAccount(), listClientServerGroupsForSelection(), loadClientAccountCatalog(), loadClientServerGroupEnvironments(), toClientServerGroup(), ClientTradingAccountCreateDialog(), handleSubmit(), loadLeverages() (+26 more)

### Community 85 - "errors.ts"
Cohesion: 0.07
Nodes (99): BrokerRequestCredentialsProps, ApiErrorAlert(), PAGE_SIZE_OPTIONS, PageNumberPaginationProps, Button(), buttonVariants, Checkbox(), Dialog() (+91 more)

### Community 87 - "contest-workspace-view.tsx"
Cohesion: 0.21
Nodes (7): tabs, getContest(), ContestWorkspaceTab, ContestWorkspaceView(), tabs, ContestsView(), formatContestWarning()

### Community 88 - "ContestBansDialog"
Cohesion: 0.33
Nodes (10): abbreviateUuid(), ContestBansDialog(), applyFiltersFromDraft(), clearFilters(), commitFilters(), handleRevert(), onFilterEnter(), patchDraft() (+2 more)

### Community 89 - "browser-client.ts"
Cohesion: 0.12
Nodes (19): startTradingCredentialsChallenge(), updateClientTradingAccountCredentials(), ClientTradingAccountCredentialsDialog(), handleStartChallenge(), handleSubmit(), BrowserBrokerRequestOptions, buildSearch(), serializeSearchParamValue() (+11 more)

### Community 90 - "positions/api.ts"
Cohesion: 0.16
Nodes (14): IbVolumeRewardTradeFlag, buildPositionsReportSearchParams(), exportPositionsReport(), getPositionReportDetail(), listPositionsReport(), download(), PositionReportDetail, PositionReportFilters (+6 more)

### Community 91 - "leverage/api.ts"
Cohesion: 0.18
Nodes (16): compactFilters(), createLeverage(), deleteLeverage(), getLeverage(), LeverageAudience, listLeverages(), updateLeverage(), handleSubmit() (+8 more)

### Community 92 - "table.tsx"
Cohesion: 0.07
Nodes (57): Badge(), badgeVariants, Table(), TableBody(), TableCell(), TableHead(), TableHeader(), TableRow() (+49 more)

### Community 93 - "ib-progression-template/api.ts"
Cohesion: 0.24
Nodes (10): createIbProgressionTemplate(), updateIbProgressionTemplate(), TemplateForm(), handleSubmit(), CreateIbProgressionTemplateInput, IbProgressionTemplate, IbProgressionTemplateLevel, IbProgressionTemplateLevelInput (+2 more)

### Community 94 - "session.server.ts"
Cohesion: 0.15
Nodes (24): displayNameFromClaims(), ADMIN_2FA_COOKIE, ADMIN_SESSION_COOKIE, CLIENT_2FA_COOKIE, CLIENT_SESSION_COOKIE, sessionCookieName(), twoFaCookieName(), decryptSession() (+16 more)

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
Cohesion: 0.19
Nodes (14): GatewayPosition, GatewayPositionsEvent, GatewaySubscriptionRejected, GatewayWelcomeFrame, isPositionsEvent(), isRecord(), isSubscriptionRejected(), isWelcomeFrame() (+6 more)

### Community 103 - "package.json"
Cohesion: 0.25
Nodes (7): name, pnpm, onlyBuiltDependencies, private, version, sharp, unrs-resolver

### Community 104 - "trading-migration/api.ts"
Cohesion: 0.23
Nodes (10): PaginatedResponse, startTradingMigration(), confirmMigration(), StartTradingMigrationInput, StartTradingMigrationResult, TradingMigrationAccount, TradingMigrationItem, TradingMigrationItemStatus (+2 more)

### Community 105 - "config-form.ts"
Cohesion: 0.24
Nodes (11): createTradingServer(), listTradingServerConfigSchemas(), updateTradingServer(), TradingServerFormDialog(), handleSubmit(), loadOptions(), buildEmptyConfig(), configFromTradingServer() (+3 more)

### Community 106 - "app-area-bar.tsx"
Cohesion: 0.13
Nodes (15): AppAreaBar(), AppAreaBarProps, AppSidebar(), AreaSwitcher(), areaTabs, ClientAppSidebar(), SidebarInset(), SidebarProvider() (+7 more)

### Community 107 - "NegativeBalanceRebalancesDataTable"
Cohesion: 0.67
Nodes (3): NegativeBalanceRebalancesDataTable(), applyFilters(), onFilterEnter()

### Community 109 - "FormsListView"
Cohesion: 0.25
Nodes (9): cloneFormVersion(), builderPath(), editableVersion(), formatVersionDate(), FormsListView(), create(), openEditor(), openPreview() (+1 more)

### Community 111 - "bonus-offer-form-dialog.tsx"
Cohesion: 0.10
Nodes (28): listEligibleIntroducingBrokers(), syncBonusOfferIntroducingBrokers(), BONUS_OFFER_FIELD_HELP, BonusOfferFormDialog(), handleSubmit(), loadEligibleIbs(), loadFormData(), loadGroups() (+20 more)

### Community 112 - "ib-analytics-view.tsx"
Cohesion: 0.22
Nodes (8): AnalyticsTab, bucketTime(), COLORS, IbAnalyticsViewProps, MainTab, RewardSeriesChart(), SOURCE_TABS, STATUSES

### Community 113 - "client-positions/api.ts"
Cohesion: 0.23
Nodes (12): accountHistoryPath(), accountPositionsPath(), closePosition(), listAccountPositions(), openPosition(), handleClose(), AccountPosition, ClosePositionInput (+4 more)

### Community 115 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 116 - "FormBuilderView"
Cohesion: 0.13
Nodes (16): FormBuilderPageProps, publishFormVersion(), saveFormDraft(), elementTitle(), FormBuilderView(), addElement(), changeDocument(), dropIntoContainer() (+8 more)

### Community 117 - "apply-position-snapshot.ts"
Cohesion: 0.24
Nodes (8): applyOpenPositionsSnapshot(), normalizeLivePosition(), toSide(), toSortableTime(), LivePositionSnapshotItem, OpenPositionsSnapshotPayload, listTradingAccountPositions(), TradingAccountPositionsDialog()

### Community 118 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 121 - "browserBrokerRequest"
Cohesion: 0.14
Nodes (18): getContestRegistrationOptions(), listEligibleAccountsForContest(), loadAccounts(), hasValidRegistrationOptions(), activateContest(), cancelContest(), createContestAward(), createContestCondition() (+10 more)

### Community 127 - "IbReferralsContent"
Cohesion: 0.36
Nodes (9): getIbReferralAccounts(), getIbReferrals(), AccountsDialog(), date(), flag(), GeoRanking(), IbReferralsContent(), money() (+1 more)

### Community 129 - "position-history/api.ts"
Cohesion: 0.36
Nodes (6): PositionSide, listPositionCommissionRewards(), loadRewards(), GlobalPosition, PositionCommissionReward, PositionHistoryFilters

### Community 130 - "ContestGlobalSettingsView"
Cohesion: 0.29
Nodes (8): getContestGlobalSettings(), mapContestGlobalSettingsResponse(), updateContestGlobalSettings(), withProxyBannerUrl(), ContestGlobalSettingsView(), handleSubmit(), settingsToForm(), parseOptionalInteger()

### Community 132 - "IbVolumeRewardTradesReportView"
Cohesion: 0.29
Nodes (7): buildReportSearchParams(), exportIbVolumeRewardTrades(), listIbVolumeRewardTrades(), IbVolumeRewardTradesReportView(), applyFilters(), download(), timestamp()

### Community 134 - "account-insurance-claim-dialogs.tsx"
Cohesion: 0.29
Nodes (6): AccountInsuranceApproveDialog(), handleApprove(), AccountInsuranceApproveDialogProps, AccountInsuranceRejectDialog(), handleReject(), AccountInsuranceRejectDialogProps

### Community 135 - "IbPaymentTemplateLevelFormDialog"
Cohesion: 0.33
Nodes (4): getNextSortOrder(), IbPaymentTemplateLevelFormDialog(), InsurancePlanOptionFormDialog(), optionToForm()

### Community 140 - "TradingSymbolsView"
Cohesion: 0.33
Nodes (3): formToAppliedFilters(), TradingSymbolsView(), applyFilters()

### Community 141 - "ib-progression-templates/page.tsx"
Cohesion: 0.40
Nodes (3): deleteIbProgressionTemplate(), IbProgressionTemplatesView(), handleDelete()

### Community 145 - "FormElementEditorSheet"
Cohesion: 0.60
Nodes (5): FormElementEditorSheet(), addOption(), patchAttributes(), patchNode(), replaceOption()

### Community 151 - "OpenPositionDialog"
Cohesion: 1.00
Nodes (3): OpenPositionDialog(), handleSubmit(), resetForm()

## Knowledge Gaps
- **579 isolated node(s):** `AdminLoginPageProps`, `ClientLoginPageProps`, `AccountMetricsPageProps`, `Props`, `ClientContestDetailPageProps` (+574 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatBrokerApiError()` connect `formatBrokerApiError` to `api-error-alert.tsx`, `ib-program-payment-rule-form-dialog.tsx`, `insurance/index.ts`, `client-risk-metrics/api.ts`, `TradingServerSecuritySymbolsView`, `alert-dialog.tsx`, `scheduled-command-run-dialog.tsx`, `ib-plan-subscription/index.ts`, `ib-payment-template/api.ts`, `listIbPaymentTemplates`, `form-builder-view.tsx`, `ib-admin-analytics-view.tsx`, `trading-server/api.ts`, `bonus-assignment-logs/index.ts`, `client-contest-detail-view.tsx`, `ib-volume-reward-trades-report-view.tsx`, `client-ib-progression-panel.tsx`, `forms-view.tsx`, `public-risk-metrics-view.tsx`, `ib-reward/index.ts`, `contest-workspace-panels.tsx`, `trading-server/format.ts`, `ib-plan-programs-sync-view.tsx`, `risk-control/api.ts`, `client-bonus-assignment-detail-dialog.tsx`, `bonus-offer-delete-dialog.tsx`, `trading-accounts-view.tsx`, `bonus-assignment-logs-view.tsx`, `client-analytics-behavior-panel.tsx`, `card.tsx`, `client-analytics-profitability-panel.tsx`, `ib-program-symbols-view.tsx`, `ib-reward-logs/index.ts`, `client-insurance/api.ts`, `ib-plan/api.ts`, `platform/api.ts`, `bonus-offer-template-form-dialog.tsx`, `TradingMigrationsView`, `bonus-offers-view.tsx`, `initial-amount/api.ts`, `configuration/api.ts`, `client-analytics-dashboard-panel.tsx`, `ib-program/api.ts`, `client-ib/format.ts`, `bonus-offer-server-groups-dialog.tsx`, `ScheduledCommandsView`, `server-group-edit-sheet.tsx`, `client-analytics-symbol-panel.tsx`, `symbol-category/api.ts`, `ib-admin-analytics/api.ts`, `PlatformsView`, `client-analytics-risk-drawdown-panel.tsx`, `IbPlanSubscriptionsView`, `BonusAssignmentLogsView`, `PositionHistoryView`, `ContestSubscriptionsView`, `client-bonus/api.ts`, `contest-general-form.tsx`, `ib-program-payment-rules-view.tsx`, `bonus-excluded-instruments-view.tsx`, `PositionsReportView`, `client-trading-account-create-dialog.tsx`, `errors.ts`, `contest-workspace-view.tsx`, `ContestBansDialog`, `browser-client.ts`, `positions/api.ts`, `leverage/api.ts`, `table.tsx`, `ib-progression-template/api.ts`, `ContestAwardsView`, `ContestConditionsView`, `IbPlansView`, `bonus-offer-admin-assign-dialog.tsx`, `RiskMetricsShareDialog`, `trading-migration/api.ts`, `config-form.ts`, `NegativeBalanceRebalancesDataTable`, `IbProgramsView`, `FormsListView`, `bonus-offer-form-dialog.tsx`, `ib-analytics-view.tsx`, `client-positions/api.ts`, `FormBuilderView`, `apply-position-snapshot.ts`, `browserBrokerRequest`, `LeveragesView`, `IbReferralsContent`, `position-history/api.ts`, `ContestGlobalSettingsView`, `RejectionTemplatesView`, `IbVolumeRewardTradesReportView`, `account-insurance-claim-dialogs.tsx`, `TradingServersView`, `TradingSecuritiesView`, `TradingSymbolsView`, `ib-progression-templates/page.tsx`, `OpenPositionDialog`?**
  _High betweenness centrality (0.264) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `api-error-alert.tsx`, `ContestGlobalSettingsView`, `ib-program-payment-rule-form-dialog.tsx`, `insurance/index.ts`, `client-risk-metrics/api.ts`, `IbVolumeRewardTradesReportView`, `alert-dialog.tsx`, `scheduled-command-run-dialog.tsx`, `form-builder-view.tsx`, `ib-admin-analytics-view.tsx`, `client-contest-detail-view.tsx`, `ib-volume-reward-trades-report-view.tsx`, `client-ib-progression-panel.tsx`, `forms-view.tsx`, `ib-reward/index.ts`, `ib-plan-programs-sync-view.tsx`, `bonus-offer-delete-dialog.tsx`, `trading-accounts-view.tsx`, `bonus-assignment-logs-view.tsx`, `client-analytics-behavior-panel.tsx`, `card.tsx`, `client-analytics-profitability-panel.tsx`, `ib-program-symbols-view.tsx`, `ib-reward-logs/index.ts`, `client-insurance/api.ts`, `client-risk-metrics-view.tsx`, `ib-plan/api.ts`, `TradingMigrationsView`, `EarningsRow`, `client-analytics-dashboard-panel.tsx`, `ib-program/api.ts`, `ScheduledCommandsView`, `server-group-edit-sheet.tsx`, `client-analytics-symbol-panel.tsx`, `ib-admin-analytics/api.ts`, `client-analytics-risk-drawdown-panel.tsx`, `BonusAssignmentLogsView`, `ib-program-payment-rules-view.tsx`, `bonus-excluded-instruments-view.tsx`, `forms/types.ts`, `PositionsReportView`, `client-trading-account-create-dialog.tsx`, `errors.ts`, `ContestBansDialog`, `table.tsx`, `app-area-bar.tsx`, `IbProgramsView`, `ib-analytics-view.tsx`, `FormBuilderView`, `IbReferralsContent`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `browserBrokerRequest()` connect `browserBrokerRequest` to `contest/api.ts`, `position-history/api.ts`, `ib-program-payment-rule-form-dialog.tsx`, `insurance/index.ts`, `IbVolumeRewardTradesReportView`, `client-risk-metrics/api.ts`, `alert-dialog.tsx`, `scheduled-command-run-dialog.tsx`, `ib-plan-subscription/index.ts`, `ib-payment-template/api.ts`, `listIbPaymentTemplates`, `ib-progression-templates/page.tsx`, `trading-server/api.ts`, `bonus-assignment-logs/index.ts`, `client-contest-detail-view.tsx`, `ib-volume-reward-trades-report-view.tsx`, `client-ib-progression-panel.tsx`, `forms-view.tsx`, `formatBrokerApiError`, `public-risk-metrics-view.tsx`, `ib-reward/index.ts`, `contest-workspace-panels.tsx`, `bonus-offer/api.ts`, `trading-server/format.ts`, `risk-control/api.ts`, `client-bonus-assignment-detail-dialog.tsx`, `bonus-offer-delete-dialog.tsx`, `trading-accounts-view.tsx`, `client-analytics-behavior-panel.tsx`, `ib-volume-reward-trades/types.ts`, `ib-program-symbols-view.tsx`, `ib-reward-logs/index.ts`, `client-insurance/api.ts`, `ib-plan/api.ts`, `platform/api.ts`, `bonus-offer-template-form-dialog.tsx`, `TradingMigrationsView`, `initial-amount/api.ts`, `configuration/api.ts`, `use-account-positions-channel.ts`, `ib-program/api.ts`, `bonus-offer-server-groups-dialog.tsx`, `client-analytics-symbol-panel.tsx`, `symbol-category/api.ts`, `ib-admin-analytics/api.ts`, `PositionHistoryView`, `ContestSubscriptionsView`, `client-bonus/api.ts`, `contest-general-form.tsx`, `ib-program-payment-rules-view.tsx`, `bonus-excluded-instruments-view.tsx`, `client-trading-account-create-dialog.tsx`, `contest-workspace-view.tsx`, `browser-client.ts`, `positions/api.ts`, `leverage/api.ts`, `ib-progression-template/api.ts`, `RiskMetricsShareDialog`, `trading-migration/api.ts`, `config-form.ts`, `FormsListView`, `bonus-offer-form-dialog.tsx`, `client-positions/api.ts`, `FormBuilderView`, `apply-position-snapshot.ts`, `IbReferralsContent`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `AdminLoginPageProps`, `ClientLoginPageProps`, `AccountMetricsPageProps` to the rest of the system?**
  _579 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `contest/api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09224489795918367 - nodes in this community are weakly interconnected._
- **Should `api-error-alert.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07802197802197802 - nodes in this community are weakly interconnected._
- **Should `insurance/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05755693581780538 - nodes in this community are weakly interconnected._