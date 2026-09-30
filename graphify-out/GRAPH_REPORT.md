# Graph Report - mmt-broker-basic-ui  (2026-09-25)

## Corpus Check
- 454 files · ~189,042 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3286 nodes · 12160 edges · 145 communities (127 shown, 18 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.58)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c29591c6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- contest/api.ts
- broker-response.ts
- ib-program-payment-rule-form-dialog.tsx
- insurance/index.ts
- cn
- client-risk-metrics/api.ts
- trading-server-groups-view.tsx
- alert-dialog.tsx
- scheduled-command-form-dialog.tsx
- ib-plan-subscription/index.ts
- client-trading-account/api.ts
- client-insurances-view.tsx
- form-builder-view.tsx
- ib-admin-analytics-view.tsx
- trading-server/api.ts
- bonus-assignment-logs-view.tsx
- client-contest-detail-view.tsx
- PositionsReportView
- client-ib-progression-panel.tsx
- forms-list-view.tsx
- formatBrokerApiError
- public-risk-metrics-view.tsx
- client-risk-metrics/types.ts
- form-document.ts
- broker-client.ts
- ib-reward/index.ts
- contest-workspace-panels.tsx
- bonus-offer/api.ts
- server-group-edit-sheet.tsx
- ib-plan-programs-sync-view.tsx
- risk-control-view.tsx
- client-bonuses-view.tsx
- trading-account-access-dialog.tsx
- trading-account/api.ts
- trading-account-positions-dialog.tsx
- client-analytics-behavior-panel.tsx
- button.tsx
- SiteHeader
- reward-lines-dialog.tsx
- client-analytics-profitability-panel.tsx
- IbProgramSymbolsView
- ib-reward-logs/index.ts
- compilerOptions
- ib-volume-reward-trades/types.ts
- client-risk-metrics-view.tsx
- ib-plan/api.ts
- platform/api.ts
- site-header.tsx
- bonus-offer-template-form-dialog.tsx
- trading-migrations-view.tsx
- ib-program-payment-rules-view.tsx
- ib-earnings-content.tsx
- readSession
- initial-amount/api.ts
- configuration-view.tsx
- client-analytics-dashboard-panel.tsx
- components.json
- TradingAccountsView
- use-account-positions-channel.ts
- auth.ts
- ib-program/api.ts
- ib-payment-template/api.ts
- dialog.tsx
- position-report-detail-dialog.tsx
- forms-view.tsx
- devDependencies
- dependencies
- client-analytics-symbol-panel.tsx
- symbol-category/api.ts
- ib-admin-analytics/api.ts
- PlatformsView
- input.tsx
- ib-plan-subscriptions-view.tsx
- client-positions/api.ts
- position-history-view.tsx
- use-trading-stream-positions-channel.ts
- client-bonus/api.ts
- ib-admin-analytics/types.ts
- contest-general-form.tsx
- TradingServerGroupsView
- BonusExcludedInstrumentsView
- ContestSubscriptionsView
- contest-workspace-view.tsx
- positions-report-view.tsx
- client-trading-account/format.ts
- api-error-alert.tsx
- session.server.ts
- ib-subscription-form-dialog.tsx
- client-analytics-risk-drawdown-panel.tsx
- errors.ts
- ib-volume-reward-trades-report-view.tsx
- leverage/api.ts
- table.tsx
- ib-progression-templates-view.tsx
- listIbPaymentTemplates
- ib-partner-tier-panel.tsx
- ContestAwardsView
- ContestConditionsView
- IbPlansView
- IB Admin Analytics
- bonus-offer-admin-assign-dialog.tsx
- RiskMetricsShareDialog
- listServerGroupsForAdmin
- package.json
- RejectionTemplatesView
- config-form.ts
- app-area-bar.tsx
- browser-client.ts
- IbProgramsView
- contests-view.tsx
- getBonusOffer
- bonus-offer-form-dialog.tsx
- skeleton.tsx
- account-insurance-claim-dialogs.tsx
- InitialAmountsView
- scripts
- IbVolumeRewardTradesReportView
- DialogTitle
- README.md
- apply-position-snapshot.ts
- insurance-plan-form-dialog.tsx
- browserBrokerRequest
- ServerGroupLeveragesSyncDialog
- client-trading-account-create-dialog.tsx
- class-variance-authority
- LeveragesView
- IbPaymentTemplateFormDialog
- ib-referrals-content.tsx
- set-symbols-category-dialog.tsx
- contest-award-form-dialog.tsx
- initial-amount-form-dialog.tsx
- initial-amount-delete-dialog.tsx
- leverage-form-dialog.tsx
- platform-form-dialog.tsx
- updateSymbolsMarkup
- IbPaymentTemplateLevelsDialog
- BonusOfferServerGroupsDialog
- eslint.config.mjs
- lucide-react
- laravel-echo
- next.config.ts
- pusher-js
- postcss.config.mjs
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

## Communities (145 total, 18 thin omitted)

### Community 0 - "contest/api.ts"
Cohesion: 0.08
Nodes (53): buildServerGroupLabel(), createContestCondition(), deleteContest(), deleteContestAward(), deleteContestCondition(), getContestGlobalSettings(), invalidateContestFormCatalog(), listEligibleIntroducingBrokers() (+45 more)

### Community 1 - "broker-response.ts"
Cohesion: 0.14
Nodes (23): ActionTooltipButton(), PageContentToolbar(), PageContentToolbarProps, awardsBreadcrumbs, awardTypeLabels, conditionsBreadcrumbs, emptyForm, FormState (+15 more)

### Community 2 - "ib-program-payment-rule-form-dialog.tsx"
Cohesion: 0.17
Nodes (25): createIbProgramCpaRule(), createIbProgramPnlRule(), createIbProgramVolumeRule(), ibProgramPath(), listIbProgramPnlRules(), listIbProgramVolumeRules(), updateIbProgramCpaRule(), updateIbProgramPnlRule() (+17 more)

### Community 3 - "insurance/index.ts"
Cohesion: 0.05
Nodes (60): approveAccountInsuranceClaim(), compactFilters(), createInsurancePlan(), createInsurancePlanOption(), deleteInsurancePlan(), deleteInsurancePlanOption(), getInsurancePlan(), listAccountInsurancesAdmin() (+52 more)

### Community 4 - "cn"
Cohesion: 0.06
Nodes (53): bonusNavigation, contestsNavigation, ibNavigation, insuranceNavigation, reportsNavigation, systemNavigation, tradingNavigation, clientNavigation (+45 more)

### Community 5 - "client-risk-metrics/api.ts"
Cohesion: 0.10
Nodes (37): analyticsOverviewInflight, analyticsOverviewRequestKey(), getAccountAnalyticsBehavior(), getAccountAnalyticsDaily(), getAccountAnalyticsDailyDayTrades(), getAccountAnalyticsDrawdowns(), getAccountAnalyticsDurationScatter(), getAccountAnalyticsEquityCurve() (+29 more)

### Community 6 - "trading-server-groups-view.tsx"
Cohesion: 0.07
Nodes (35): TradingSecuritiesPageProps, TradingSymbolsPageProps, Alert(), AlertDescription(), AlertTitle(), alertVariants, getPlatform(), Platform (+27 more)

### Community 7 - "alert-dialog.tsx"
Cohesion: 0.16
Nodes (28): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogTitle() (+20 more)

### Community 8 - "scheduled-command-form-dialog.tsx"
Cohesion: 0.07
Nodes (42): hasActiveScheduledCommandRun(), buildListSearchParams(), cancelScheduledCommandRun(), getScheduledCommand(), listScheduledCommands(), runScheduledCommand(), updateScheduledCommand(), formatDateTime() (+34 more)

### Community 9 - "ib-plan-subscription/index.ts"
Cohesion: 0.12
Nodes (35): adminSubscriptionsPath(), createIbPlanSubscription(), getIbPlanSubscriptionFormSubmission(), listIbPlanSubscriptionAdminInteractions(), listIbPlanSubscriptions(), toSearchParams(), updateIbPlanSubscription(), updateIbPlanSubscriptionParameters() (+27 more)

### Community 10 - "client-trading-account/api.ts"
Cohesion: 0.12
Nodes (24): createClientTradingAccount(), listClientServerGroupsForSelection(), loadClientAccountCatalog(), loadClientServerGroupEnvironments(), startTradingCredentialsChallenge(), toClientServerGroup(), updateClientTradingAccountCredentials(), handleSubmit() (+16 more)

### Community 11 - "client-insurances-view.tsx"
Cohesion: 0.07
Nodes (45): cancelClientAccountInsurance(), claimClientAccountInsurance(), compactFilters(), contractClientAccountInsurance(), isInsuranceCandidateAccount(), listClientAccountInsurances(), listInsurancePlansForAccount(), loadAccountsWithInProgressInsurance() (+37 more)

### Community 12 - "form-builder-view.tsx"
Cohesion: 0.15
Nodes (15): FormBuilderPageProps, DashboardBreadcrumbsProps, Breadcrumb(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator() (+7 more)

### Community 13 - "ib-admin-analytics-view.tsx"
Cohesion: 0.14
Nodes (21): AnalyticsKpis(), AnalyticsSeriesChart(), AnalyticsTab, availabilityReason(), CATEGORY_COLORS, CategoryDistribution(), ClientFunnel(), CommissionBySource() (+13 more)

### Community 14 - "trading-server/api.ts"
Cohesion: 0.12
Nodes (37): cachedEnvironmentsByAudience, configSchemasByPlatform, configSchemasDeniedPlatforms, deleteTradingServer(), getTradingServer(), listSecurities(), listSecuritySymbols(), listServerGroupLeverages() (+29 more)

### Community 15 - "bonus-assignment-logs-view.tsx"
Cohesion: 0.06
Nodes (69): cancelBonusAssignment(), compactFilters(), getBonusAssignment(), listBonusAssignments(), listBonusNegativeBalanceCompensations(), listDepositBonusIntents(), BonusAssignmentDetailDialog(), loadAssignment() (+61 more)

### Community 16 - "client-contest-detail-view.tsx"
Cohesion: 0.09
Nodes (38): ClientContestDetailPageProps, ClientContestsPage(), compactFilters(), getContestBannerUrl(), getContestLeaderboardTop(), getContestRegistrationOptions(), getContestSubscription(), getPublicContest() (+30 more)

### Community 17 - "PositionsReportView"
Cohesion: 0.15
Nodes (10): buildPositionsReportSearchParams(), exportPositionsReport(), listPositionsReport(), activeCount(), datetimeInput(), fromSearch(), PositionsReportView(), apply() (+2 more)

### Community 18 - "client-ib-progression-panel.tsx"
Cohesion: 0.09
Nodes (36): CardFooter(), compactFilters(), getActiveIbPlanContext(), getMyIbPlanSubscription(), listClientIbPlans(), listMyIbPlanProgressionLogs(), subscribeToIbPlan(), withProxyClientPlan() (+28 more)

### Community 19 - "forms-list-view.tsx"
Cohesion: 0.09
Nodes (34): archiveFormVersion(), cloneFormVersion(), createForm(), deleteForm(), getForm(), getFormVersion(), listForms(), publishFormVersion() (+26 more)

### Community 20 - "formatBrokerApiError"
Cohesion: 0.05
Nodes (39): BonusOfferDeleteDialog(), handleDelete(), BonusOfferDeleteDialogProps, BonusOfferTemplateDeleteDialog(), handleDelete(), ContestAwardDeleteDialog(), handleDelete(), ContestConditionDeleteDialog() (+31 more)

### Community 21 - "public-risk-metrics-view.tsx"
Cohesion: 0.07
Nodes (32): PublicRiskMetricsPageProps, getPublicRiskMetricsSummary(), applyLiveEquityChange(), applyRiskMetricChanges(), parseMetricJsonValue(), toUnixSecond(), toUtcDateKey(), PublicAnalyticsOverviewView() (+24 more)

### Community 22 - "client-risk-metrics/types.ts"
Cohesion: 0.04
Nodes (47): AnalyticsCumulativePnl, AnalyticsDailyDayBehavior, AnalyticsDailyStats, AnalyticsDailyStreakSegment, AnalyticsDailyTradeRow, AnalyticsDailyTransitionMatrix, AnalyticsDashboard, AnalyticsDurationScatterPoint (+39 more)

### Community 23 - "form-document.ts"
Cohesion: 0.13
Nodes (31): elementTitle(), FormBuilderView(), addElement(), changeDocument(), dropIntoContainer(), removeElement(), updateElement(), isPaletteType() (+23 more)

### Community 24 - "broker-client.ts"
Cohesion: 0.09
Nodes (31): DELETE, GET, handle(), PATCH, POST, PUT, RouteContext, buildIamUpstreamUrl() (+23 more)

### Community 25 - "ib-reward/index.ts"
Cohesion: 0.19
Nodes (13): compactFilters(), listIbRewards(), IbRewardsView(), formatDateTimeValue(), formatMoneyValue(), paymentRuleTypeLabel(), sourceTypeLabel(), IB_PAYMENT_RULE_TYPES (+5 more)

### Community 26 - "contest-workspace-panels.tsx"
Cohesion: 0.08
Nodes (40): assignContestAward(), assignContestCondition(), listAssignedContestAwards(), listAssignedContestConditions(), listContestAwards(), listContestBans(), listContestConditions(), revertContestBan() (+32 more)

### Community 27 - "bonus-offer/api.ts"
Cohesion: 0.13
Nodes (33): deleteBonusOffer(), invalidateBonusOfferFormCatalog(), listBonusOffers(), listBonusOfferTemplates(), listEligibleIntroducingBrokers(), loadBonusOfferFormCatalog(), syncBonusExcludedInstruments(), syncBonusOfferServerGroups() (+25 more)

### Community 28 - "server-group-edit-sheet.tsx"
Cohesion: 0.15
Nodes (27): toServerGroupOption(), toServerGroupOption(), updateServerGroup(), emptyCountryRow(), ServerGroupEditSheet(), handleSubmit(), ServerGroupEditSheetProps, buildServerGroupEditFormState() (+19 more)

### Community 29 - "ib-plan-programs-sync-view.tsx"
Cohesion: 0.11
Nodes (31): IbPlanProgramsPageProps, IbPlanProgramPivotFormDialog(), handleSubmit(), AvailableProgramItem(), handleDragStart(), formatProgressionMaxVolume(), IbPlanProgramsSyncView(), handleAssignedDrop() (+23 more)

### Community 30 - "risk-control-view.tsx"
Cohesion: 0.10
Nodes (31): Props, Props, archiveRiskControlRule(), createRiskControlRule(), listRiskControlExecutions(), listRiskControlRules(), loadRiskControlCatalog(), prefix() (+23 more)

### Community 31 - "client-bonuses-view.tsx"
Cohesion: 0.16
Nodes (24): getClientBonusAssignment(), listAvailableBonusOffers(), ClientBonusAssignmentDetailDialog(), loadAssignment(), ClientBonusAssignmentDetailDialogProps, ClientBonusClaimDialog(), clientBonusesBreadcrumbs, ClientBonusesView() (+16 more)

### Community 32 - "trading-account-access-dialog.tsx"
Cohesion: 0.14
Nodes (25): ContestSubscriptionBanDialogProps, compactFilters(), createRejectionTemplate(), deleteRejectionTemplate(), getRejectionTemplate(), listRejectionTemplates(), updateRejectionTemplate(), RejectionReasonComposer (+17 more)

### Community 33 - "trading-account/api.ts"
Cohesion: 0.15
Nodes (21): ListTradingAccountPositionsParams, listTradingAccounts(), resetTradingAccountCredentials(), ResetTradingAccountCredentialsInput, toSearchParams(), TradingAccountListMeta, TradingAccountListResponse, updateTradingAccount() (+13 more)

### Community 34 - "trading-account-positions-dialog.tsx"
Cohesion: 0.15
Nodes (14): AccountPositionsPageProps, ClientPositionsPanel(), ClientPositionsPanelProps, emptyStateByFilter, PositionsFilter, formatNumber(), formatOpenedAt(), formatSide() (+6 more)

### Community 35 - "client-analytics-behavior-panel.tsx"
Cohesion: 0.10
Nodes (24): buildCalendarGrid(), CalendarMonthView(), CalendarViewMode, CalendarYearView(), ClientAnalyticsBehaviorPanel(), load(), ClientAnalyticsBehaviorPanelProps, dailyKey() (+16 more)

### Community 36 - "button.tsx"
Cohesion: 0.18
Nodes (10): Button(), buttonVariants, ContestConditionFormDialogProps, emptyForm, FormState, PositionCommissionRewardsDialogProps, emptyForm, FormState (+2 more)

### Community 37 - "SiteHeader"
Cohesion: 0.16
Nodes (17): BrokerRequestCredentials(), SiteHeader(), Card(), CardAction(), CardContent(), CardDescription(), CardHeader(), CardTitle() (+9 more)

### Community 38 - "reward-lines-dialog.tsx"
Cohesion: 0.15
Nodes (27): getIbVolumeRewardTradeRewards(), identity(), paymentTemplateLabel(), planProgramLabel(), serverGroup(), TotalsTable(), TradesTable(), EconomyRow() (+19 more)

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

### Community 43 - "ib-volume-reward-trades/types.ts"
Cohesion: 0.10
Nodes (22): buildReportSearchParams(), exportIbVolumeRewardTrades(), listIbVolumeRewardTrades(), download(), CalculationAvailability, IbVolumeDirectReward, IbVolumeRewardLine, IbVolumeRewardRatioBucket (+14 more)

### Community 44 - "client-risk-metrics-view.tsx"
Cohesion: 0.08
Nodes (23): AccountMetricsPageProps, ANALYTICS_TABS, AnalyticsTab, applyAnalyticsUpdate(), applyDashboardMetrics(), applyPhaseMetricsUpdate(), ClientRiskMetricsView(), loadSymbolOptions() (+15 more)

### Community 45 - "ib-plan/api.ts"
Cohesion: 0.17
Nodes (26): appendIbPlanFormData(), createIbPlan(), deleteIbPlan(), listIbPlanPrograms(), listIbPlans(), mapIbPlanResponse(), mapIbPlansResponse(), seedIbDemoCatalog() (+18 more)

### Community 46 - "platform/api.ts"
Cohesion: 0.17
Nodes (18): appendPlatformFormData(), createPlatform(), deletePlatform(), listAvailablePlatforms(), listConfiguredPlatforms(), listPlatforms(), mapPlatformResponse(), mapPlatformsResponse() (+10 more)

### Community 47 - "site-header.tsx"
Cohesion: 0.12
Nodes (6): TradingServersPageProps, TradingServerGroupsPageProps, DashboardBreadcrumbs(), SiteHeaderProps, ContestGlobalSettingsView(), settingsToForm()

### Community 48 - "bonus-offer-template-form-dialog.tsx"
Cohesion: 0.06
Nodes (43): BonusOffersView(), clearFilters(), commitFilters(), onFilterEnter(), patchDraft(), toggleSort(), formatExpiresAt(), formatRewardSummary() (+35 more)

### Community 49 - "trading-migrations-view.tsx"
Cohesion: 0.10
Nodes (21): getMigrationRun(), listMigrationAccounts(), listMigrationRuns(), PaginatedResponse, startTradingMigration(), breadcrumbs, formatDate(), labelForStatus() (+13 more)

### Community 50 - "ib-program-payment-rules-view.tsx"
Cohesion: 0.15
Nodes (11): listIbProgramCpaRules(), IbProgramPaymentRuleFormDialog(), ruleTypeLabel(), ibProgramPaymentRulesBreadcrumbs, IbProgramPaymentRulesView(), renderRuleDetails(), RuleRecord, formatAmount() (+3 more)

### Community 51 - "ib-earnings-content.tsx"
Cohesion: 0.16
Nodes (17): EarningsCards(), EarningsControls, EarningsRow(), formatDate(), formatMoney(), IbEarningsContent(), IbEarningsContentProps, rateLabel() (+9 more)

### Community 52 - "readSession"
Cohesion: 0.21
Nodes (14): AdminLoginPage(), AdminLoginPageProps, ClientLoginPage(), ClientLoginPageProps, ClientHomePage(), DashboardPage(), loginHref(), resolveAuthArea() (+6 more)

### Community 53 - "initial-amount/api.ts"
Cohesion: 0.27
Nodes (9): compactFilters(), getInitialAmount(), listInitialAmounts(), CreateInitialAmountInput, InitialAmount, InitialAmountListFilters, InitialAmountServerGroup, SyncInitialAmountServerGroupsInput (+1 more)

### Community 54 - "configuration-view.tsx"
Cohesion: 0.16
Nodes (17): listConfigs(), updateConfigsBatch(), breadcrumbs, ConfigField(), ConfigurationView(), handleSave(), CATEGORY_LABELS, categoryLabel() (+9 more)

### Community 55 - "client-analytics-dashboard-panel.tsx"
Cohesion: 0.14
Nodes (21): AnalyticsDashboardSnapshot, ChartToggleChip(), ClientAnalyticsDashboardPanel(), ClientAnalyticsDashboardPanelProps, formatCurrency(), formatMetric(), formatNumber(), formatPercent() (+13 more)

### Community 56 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 57 - "TradingAccountsView"
Cohesion: 0.12
Nodes (15): abbreviateUuid(), formatMoney(), formToAppliedFilters(), parseOptionalNumber(), pnlClassName(), TradingAccountsView(), applyFiltersFromDraft(), changePage() (+7 more)

### Community 58 - "use-account-positions-channel.ts"
Cohesion: 0.16
Nodes (16): accountWatchPath(), heartbeatOpenPositionsWatch(), unwatchOpenPositions(), watchOpenPositions(), PositionsLiveStatus, useAccountPositionsChannel(), UseAccountPositionsChannelOptions, accountPositionsPrivateChannel() (+8 more)

### Community 59 - "auth.ts"
Cohesion: 0.13
Nodes (29): iamForwardHeaders(), LOGIN_PATH, loginAction(), logoutAction(), parseArea(), formAction(), LoginForm(), LoginFormProps (+21 more)

### Community 60 - "ib-program/api.ts"
Cohesion: 0.20
Nodes (16): appendIbProgramFormData(), createIbProgram(), deleteIbProgram(), listIbPrograms(), mapIbProgramResponse(), mapIbProgramsResponse(), updateIbProgram(), withProxyImagePath() (+8 more)

### Community 61 - "ib-payment-template/api.ts"
Cohesion: 0.23
Nodes (16): createIbPaymentTemplate(), createIbPaymentTemplateLevel(), deleteIbPaymentTemplate(), deleteIbPaymentTemplateLevel(), updateIbPaymentTemplateLevel(), handleSubmit(), handleSubmit(), formatPaymentTemplateRate() (+8 more)

### Community 62 - "dialog.tsx"
Cohesion: 0.11
Nodes (23): BrokerRequestCredentialsProps, CredentialValue(), Dialog(), DialogContent(), DialogDescription(), DialogHeader(), DialogTrigger(), ClientBonusClaimDialogProps (+15 more)

### Community 63 - "position-report-detail-dialog.tsx"
Cohesion: 0.20
Nodes (13): paymentStatusLabel(), paymentStatusVariant(), getPositionReportDetail(), identity(), PositionReportDetailDialog(), PositionReportDetail, PositionReportFilters, PositionReportIdentity (+5 more)

### Community 64 - "forms-view.tsx"
Cohesion: 0.14
Nodes (21): Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetTitle(), FormElementEditorSheet(), addOption() (+13 more)

### Community 65 - "devDependencies"
Cohesion: 0.11
Nodes (19): babel-plugin-react-compiler, eslint, eslint-config-next, devDependencies, babel-plugin-react-compiler, eslint, eslint-config-next, tailwindcss (+11 more)

### Community 66 - "dependencies"
Cohesion: 0.11
Nodes (19): @base-ui/react, clsx, lightweight-charts, next, dependencies, @base-ui/react, clsx, lightweight-charts (+11 more)

### Community 67 - "client-analytics-symbol-panel.tsx"
Cohesion: 0.20
Nodes (15): ClientAnalyticsSymbolPanel(), load(), ClientAnalyticsSymbolPanelProps, formatNumber(), formatPercent(), formatSideLabel(), formatSymbolMetric(), MetricRow() (+7 more)

### Community 68 - "symbol-category/api.ts"
Cohesion: 0.18
Nodes (13): compactFilters(), createSymbolCategory(), deleteSymbolCategory(), listAllSymbolCategories(), listSymbolCategories(), updateSymbolCategory(), SymbolCategoriesView(), SymbolCategoryFormDialog() (+5 more)

### Community 69 - "ib-admin-analytics/api.ts"
Cohesion: 0.16
Nodes (19): earningsSearchParams(), getIbAnalytics(), getIbAnalyticsOverview(), getIbEarnings(), getIbEarningsDailyTrades(), getIbReferrals(), getIbReferralsGeo(), IbAnalyticsOverviewFilters (+11 more)

### Community 71 - "input.tsx"
Cohesion: 0.15
Nodes (13): Input(), bonusOfferExcludedInstrumentsPath(), bonusOfferTemplateExcludedInstrumentsPath(), bonusOffersBreadcrumbs, bonusOfferTypeLabels, ColumnSortHeadProps, formToAppliedFilters(), parseOptionalNumber() (+5 more)

### Community 72 - "ib-plan-subscriptions-view.tsx"
Cohesion: 0.05
Nodes (37): IbPlanSubscriptionsPageProps, DropdownMenu(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuSeparator(), DropdownMenuTrigger(), adminLabel() (+29 more)

### Community 73 - "client-positions/api.ts"
Cohesion: 0.18
Nodes (15): accountHistoryPath(), accountPositionsPath(), closePosition(), listAccountPositions(), openPosition(), handleClose(), OpenPositionDialog(), handleSubmit() (+7 more)

### Community 74 - "position-history-view.tsx"
Cohesion: 0.13
Nodes (16): PositionSide, listGlobalPositions(), listPositionCommissionRewards(), formatAmount(), PositionCommissionRewardsDialog(), loadRewards(), DEFAULTS, FILTER_KEYS (+8 more)

### Community 75 - "use-trading-stream-positions-channel.ts"
Cohesion: 0.17
Nodes (15): GatewayPosition, GatewayPositionsEvent, GatewaySubscriptionRejected, GatewayWelcomeFrame, isPositionsEvent(), isRecord(), isSubscriptionRejected(), isWelcomeFrame() (+7 more)

### Community 76 - "client-bonus/api.ts"
Cohesion: 0.15
Nodes (15): BonusOffer, BonusOfferType, claimBonusOffer(), compactFilters(), listClientBonusAssignments(), listEligibleAccountsForBonusOffer(), handleSubmit(), loadAccounts() (+7 more)

### Community 77 - "ib-admin-analytics/types.ts"
Cohesion: 0.12
Nodes (16): IbAnalyticsAvailability, IbAnalyticsCountry, IbAnalyticsHistoricalRule, IbAnalyticsMetricGroup, IbAnalyticsMoney, IbAnalyticsMoneyAvailability, IbAnalyticsMoneyBreakdown, IbEarningsCards (+8 more)

### Community 78 - "contest-general-form.tsx"
Cohesion: 0.23
Nodes (13): createContest(), updateContest(), amountStep(), ContestGeneralForm(), handleSubmit(), ContestGeneralFormProps, contestToForm(), emptyForm (+5 more)

### Community 79 - "TradingServerGroupsView"
Cohesion: 0.20
Nodes (4): formToAppliedFilters(), TradingServerGroupsView(), applyFilters(), formatBookTypeLabel()

### Community 80 - "BonusExcludedInstrumentsView"
Cohesion: 0.22
Nodes (11): BonusExcludedInstrumentsView(), handleAddSymbol(), handleSave(), ExcludedInstrumentDraft, draftsSignature(), draftToSyncInput(), excludedInstrumentFromApi(), excludedInstrumentFromTradingSymbol() (+3 more)

### Community 81 - "ContestSubscriptionsView"
Cohesion: 0.14
Nodes (17): listContestParticipants(), listContests(), storeContestBan(), toSearchParams(), ContestSubscriptionBanDialog(), handleBan(), abbreviateUuid(), ContestSubscriptionsView() (+9 more)

### Community 82 - "contest-workspace-view.tsx"
Cohesion: 0.17
Nodes (14): tabs, ClientContestsView(), getContest(), handleSubmit(), ContestWorkspaceTab, ContestWorkspaceView(), tabs, ContestsView() (+6 more)

### Community 83 - "positions-report-view.tsx"
Cohesion: 0.18
Nodes (10): buildPageItems(), PAGE_SIZE_OPTIONS, PageNumberPagination(), PageNumberPaginationProps, subscribeToHydration(), REPORT_FLAGS, DEFAULT_FILTERS, RANGE_FILTERS (+2 more)

### Community 84 - "client-trading-account/format.ts"
Cohesion: 0.16
Nodes (12): ClientTradingAccountCreateDialog(), loadLeverages(), loadServerGroups(), enrichAccounts(), formatLeverageLabel(), formatAccountMoney(), formatEnvironmentLabel(), moneyFormatter (+4 more)

### Community 85 - "api-error-alert.tsx"
Cohesion: 0.12
Nodes (28): ApiErrorAlert(), ApiErrorAlertProps, Checkbox(), DialogFooter(), Label(), CancelBonusAssignmentDialogProps, BonusOfferIntroducingBrokersDialogProps, BonusOfferServerGroupsDialogProps (+20 more)

### Community 86 - "session.server.ts"
Cohesion: 0.14
Nodes (23): iamRefresh(), decodeJwtPayload(), displayNameFromClaims(), jwtPayloadSegment(), ADMIN_2FA_COOKIE, ADMIN_SESSION_COOKIE, CLIENT_2FA_COOKIE, CLIENT_SESSION_COOKIE (+15 more)

### Community 87 - "ib-subscription-form-dialog.tsx"
Cohesion: 0.33
Nodes (7): getIbPlanSubscriptionForm(), fieldErrors(), findForm(), IbSubscriptionFormDialog(), handleSubmit(), inputNodes(), Props

### Community 88 - "client-analytics-risk-drawdown-panel.tsx"
Cohesion: 0.20
Nodes (14): ClientAnalyticsRiskDrawdownPanel(), ClientAnalyticsRiskDrawdownPanelProps, formatCurrency(), formatDays(), formatNumber(), formatPercent(), formatSignedCurrency(), MetricRow() (+6 more)

### Community 89 - "errors.ts"
Cohesion: 0.38
Nodes (7): BrokerApiError, BrokerErrorDetails, extractValidationMessages(), humanizeValidationMessage(), isRecord(), parseBrokerErrorPayload(), ParsedBrokerError

### Community 90 - "ib-volume-reward-trades-report-view.tsx"
Cohesion: 0.13
Nodes (15): geistMono, geistSans, metadata, ActionTooltipButtonProps, Tooltip(), TooltipContent(), TooltipProvider(), TooltipTrigger() (+7 more)

### Community 91 - "leverage/api.ts"
Cohesion: 0.26
Nodes (13): compactFilters(), createLeverage(), deleteLeverage(), getLeverage(), LeverageAudience, listLeverages(), updateLeverage(), LeverageFormDialog() (+5 more)

### Community 92 - "table.tsx"
Cohesion: 0.11
Nodes (49): Badge(), badgeVariants, SelectContent(), SelectItem(), SelectTrigger(), SelectValue(), Table(), TableBody() (+41 more)

### Community 93 - "ib-progression-templates-view.tsx"
Cohesion: 0.18
Nodes (15): createIbProgressionTemplate(), deleteIbProgressionTemplate(), listIbProgressionTemplates(), updateIbProgressionTemplate(), IbProgressionTemplatesView(), handleDelete(), TemplateForm(), handleSubmit() (+7 more)

### Community 94 - "listIbPaymentTemplates"
Cohesion: 0.22
Nodes (3): listIbPaymentTemplates(), IbPaymentTemplatesView(), summarizeLevels()

### Community 95 - "ib-partner-tier-panel.tsx"
Cohesion: 0.15
Nodes (12): IbAnalyticsView(), IbAnalyticsViewProps, Tab, evaluationPeriod(), IbPartnerTierPanel(), number(), Props, rate() (+4 more)

### Community 99 - "IB Admin Analytics"
Cohesion: 0.10
Nodes (16): Cumplimiento, Decisiones, Fase 1 — Overview, Necesidades posteriores, Fase 2 — Analytics, Comportamiento implementado, Contrato consumido, Fase 3 — Earnings (+8 more)

### Community 100 - "bonus-offer-admin-assign-dialog.tsx"
Cohesion: 0.23
Nodes (14): adminAssignBonus(), listEligibleAccountsForBonusOfferAdmin(), BonusOfferAdminAssignDialog(), handleAssign(), handleLoadAccounts(), handleOpenChange(), resetState(), BonusOfferAdminAssignDialogProps (+6 more)

### Community 101 - "RiskMetricsShareDialog"
Cohesion: 0.32
Nodes (8): createRiskMetricShare(), getAccountRiskMetricShare(), updateRiskMetricShare(), buildShareUrl(), RiskMetricsShareDialog(), handleCopyLink(), handleDisable(), handleEnable()

### Community 102 - "listServerGroupsForAdmin"
Cohesion: 0.18
Nodes (8): loadGroups(), loadServerGroupOptionsForPlatform(), loadData(), loadData(), loadData(), listServerGroupsForAdmin(), listTradingServersForAdmin(), TradingServersView()

### Community 103 - "package.json"
Cohesion: 0.25
Nodes (7): name, pnpm, onlyBuiltDependencies, private, version, sharp, unrs-resolver

### Community 105 - "config-form.ts"
Cohesion: 0.22
Nodes (12): createTradingServer(), listTradingServerConfigSchemas(), updateTradingServer(), TradingServerFormDialog(), handleSubmit(), loadOptions(), buildEmptyConfig(), configFromTradingServer() (+4 more)

### Community 106 - "app-area-bar.tsx"
Cohesion: 0.13
Nodes (15): AppAreaBar(), AppAreaBarProps, AppSidebar(), AreaSwitcher(), areaTabs, ClientAppSidebar(), SidebarInset(), SidebarProvider() (+7 more)

### Community 107 - "browser-client.ts"
Cohesion: 0.32
Nodes (6): BrowserBrokerRequestOptions, buildSearch(), serializeSearchParamValue(), BrowserIamRequestOptions, BrokerSuccessResponse, isBrokerSuccessResponse()

### Community 109 - "contests-view.tsx"
Cohesion: 0.17
Nodes (9): CLIENT_CONTEST_STATUSES, clientContestsBreadcrumbs, statusLabels, statusLabelsEs, contestsBreadcrumbs, statusLabels, CONTEST_STATUSES, ContestStatus (+1 more)

### Community 110 - "getBonusOffer"
Cohesion: 0.33
Nodes (6): getBonusOffer(), syncBonusOfferIntroducingBrokers(), BonusOfferIntroducingBrokersDialog(), handleSubmit(), loadData(), sortedIdsSignature()

### Community 111 - "bonus-offer-form-dialog.tsx"
Cohesion: 0.14
Nodes (22): createBonusOffer(), updateBonusOffer(), BonusOfferFormDialog(), handleSubmit(), loadEligibleIbs(), loadFormData(), BonusOfferFormDialogProps, buildCreatePayload() (+14 more)

### Community 112 - "skeleton.tsx"
Cohesion: 0.13
Nodes (6): TradingServerSecuritySymbolsPageProps, TradingServerGroupSecuritiesPageProps, Skeleton(), BonusExcludedInstrumentsViewProps, TradingSymbolsTableProps, TradingSymbol

### Community 113 - "account-insurance-claim-dialogs.tsx"
Cohesion: 0.29
Nodes (6): AccountInsuranceApproveDialog(), handleApprove(), AccountInsuranceApproveDialogProps, AccountInsuranceRejectDialog(), handleReject(), AccountInsuranceRejectDialogProps

### Community 115 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 116 - "IbVolumeRewardTradesReportView"
Cohesion: 0.33
Nodes (3): IbVolumeRewardTradesReportView(), applyFilters(), timestamp()

### Community 117 - "DialogTitle"
Cohesion: 0.31
Nodes (7): DialogTitle(), emptyForm, FormState, getNextSortOrder(), IbPaymentTemplateLevelFormDialog(), IbPaymentTemplateLevelFormDialogProps, IbPaymentTemplateLevelsDialogProps

### Community 118 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 119 - "apply-position-snapshot.ts"
Cohesion: 0.53
Nodes (5): applyOpenPositionsSnapshot(), normalizeLivePosition(), toSide(), toSortableTime(), OpenPositionsSnapshotPayload

### Community 120 - "insurance-plan-form-dialog.tsx"
Cohesion: 0.40
Nodes (5): emptyForm, FormState, InsurancePlanFormDialog(), InsurancePlanFormDialogProps, planToForm()

### Community 121 - "browserBrokerRequest"
Cohesion: 0.11
Nodes (27): activateContest(), cancelContest(), createContestAward(), updateContestAward(), ContestAwardFormDialog(), handleSubmit(), ContestLifecycleDialog(), handleConfirm() (+19 more)

### Community 122 - "ServerGroupLeveragesSyncDialog"
Cohesion: 0.40
Nodes (4): synchronizeServerGroupLeverages(), ServerGroupLeveragesSyncDialog(), handleSubmit(), loadLeverages()

### Community 123 - "client-trading-account-create-dialog.tsx"
Cohesion: 0.40
Nodes (3): ClientTradingAccountCreateDialogProps, SelectableCardProps, TRADING_SERVER_ENVIRONMENT

### Community 126 - "IbPaymentTemplateFormDialog"
Cohesion: 0.50
Nodes (3): createLevelDraft(), IbPaymentTemplateFormDialog(), addLevel()

### Community 127 - "ib-referrals-content.tsx"
Cohesion: 0.20
Nodes (16): getIbReferralAccounts(), IbAnalyticsAudience, IbAnalyticsFilters, AccountsDialog(), ChildState, date(), flag(), GeoRanking() (+8 more)

### Community 128 - "set-symbols-category-dialog.tsx"
Cohesion: 0.40
Nodes (5): scopeDescription(), handleSubmit(), SetSymbolsCategoryDialogProps, successMessage(), toRequestBody()

### Community 129 - "contest-award-form-dialog.tsx"
Cohesion: 0.50
Nodes (3): ContestAwardFormDialogProps, emptyForm, FormState

### Community 130 - "initial-amount-form-dialog.tsx"
Cohesion: 0.50
Nodes (3): emptyForm, FormState, InitialAmountFormDialogProps

### Community 131 - "initial-amount-delete-dialog.tsx"
Cohesion: 0.24
Nodes (8): deleteInitialAmount(), syncInitialAmountServerGroups(), InitialAmountDeleteDialog(), handleDelete(), InitialAmountDeleteDialogProps, InitialAmountServerGroupsDialog(), handleSubmit(), formatInitialAmount()

### Community 132 - "leverage-form-dialog.tsx"
Cohesion: 0.50
Nodes (3): emptyForm, FormState, LeverageFormDialogProps

### Community 133 - "platform-form-dialog.tsx"
Cohesion: 0.50
Nodes (3): emptyForm, FormState, PlatformFormDialogProps

### Community 134 - "updateSymbolsMarkup"
Cohesion: 0.50
Nodes (4): updateSymbolsMarkup(), handleSubmit(), successMessage(), toRequestBody()

## Knowledge Gaps
- **580 isolated node(s):** `AdminLoginPageProps`, `ClientLoginPageProps`, `AccountMetricsPageProps`, `AccountPositionsPageProps`, `Props` (+575 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `formatBrokerApiError()` connect `formatBrokerApiError` to `contest/api.ts`, `broker-response.ts`, `ib-program-payment-rule-form-dialog.tsx`, `insurance/index.ts`, `client-risk-metrics/api.ts`, `trading-server-groups-view.tsx`, `alert-dialog.tsx`, `scheduled-command-form-dialog.tsx`, `ib-plan-subscription/index.ts`, `client-trading-account/api.ts`, `client-insurances-view.tsx`, `form-builder-view.tsx`, `ib-admin-analytics-view.tsx`, `bonus-assignment-logs-view.tsx`, `client-contest-detail-view.tsx`, `PositionsReportView`, `client-ib-progression-panel.tsx`, `forms-list-view.tsx`, `public-risk-metrics-view.tsx`, `form-document.ts`, `ib-reward/index.ts`, `contest-workspace-panels.tsx`, `server-group-edit-sheet.tsx`, `ib-plan-programs-sync-view.tsx`, `risk-control-view.tsx`, `client-bonuses-view.tsx`, `trading-account-access-dialog.tsx`, `trading-account/api.ts`, `trading-account-positions-dialog.tsx`, `client-analytics-behavior-panel.tsx`, `button.tsx`, `SiteHeader`, `reward-lines-dialog.tsx`, `client-analytics-profitability-panel.tsx`, `IbProgramSymbolsView`, `ib-reward-logs/index.ts`, `ib-volume-reward-trades/types.ts`, `ib-plan/api.ts`, `platform/api.ts`, `site-header.tsx`, `bonus-offer-template-form-dialog.tsx`, `trading-migrations-view.tsx`, `ib-program-payment-rules-view.tsx`, `ib-earnings-content.tsx`, `configuration-view.tsx`, `client-analytics-dashboard-panel.tsx`, `TradingAccountsView`, `ib-program/api.ts`, `ib-payment-template/api.ts`, `dialog.tsx`, `position-report-detail-dialog.tsx`, `forms-view.tsx`, `client-analytics-symbol-panel.tsx`, `symbol-category/api.ts`, `ib-admin-analytics/api.ts`, `PlatformsView`, `input.tsx`, `ib-plan-subscriptions-view.tsx`, `client-positions/api.ts`, `position-history-view.tsx`, `client-bonus/api.ts`, `contest-general-form.tsx`, `TradingServerGroupsView`, `BonusExcludedInstrumentsView`, `ContestSubscriptionsView`, `contest-workspace-view.tsx`, `positions-report-view.tsx`, `client-trading-account/format.ts`, `api-error-alert.tsx`, `ib-subscription-form-dialog.tsx`, `client-analytics-risk-drawdown-panel.tsx`, `errors.ts`, `ib-volume-reward-trades-report-view.tsx`, `leverage/api.ts`, `table.tsx`, `ib-progression-templates-view.tsx`, `listIbPaymentTemplates`, `ib-partner-tier-panel.tsx`, `ContestAwardsView`, `ContestConditionsView`, `IbPlansView`, `bonus-offer-admin-assign-dialog.tsx`, `RiskMetricsShareDialog`, `listServerGroupsForAdmin`, `RejectionTemplatesView`, `config-form.ts`, `IbProgramsView`, `contests-view.tsx`, `getBonusOffer`, `bonus-offer-form-dialog.tsx`, `skeleton.tsx`, `account-insurance-claim-dialogs.tsx`, `InitialAmountsView`, `IbVolumeRewardTradesReportView`, `DialogTitle`, `insurance-plan-form-dialog.tsx`, `browserBrokerRequest`, `ServerGroupLeveragesSyncDialog`, `client-trading-account-create-dialog.tsx`, `LeveragesView`, `ib-referrals-content.tsx`, `set-symbols-category-dialog.tsx`, `contest-award-form-dialog.tsx`, `initial-amount-form-dialog.tsx`, `initial-amount-delete-dialog.tsx`, `leverage-form-dialog.tsx`, `platform-form-dialog.tsx`, `updateSymbolsMarkup`, `BonusOfferServerGroupsDialog`?**
  _High betweenness centrality (0.240) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `broker-response.ts`, `ib-program-payment-rule-form-dialog.tsx`, `insurance/index.ts`, `client-risk-metrics/api.ts`, `trading-server-groups-view.tsx`, `alert-dialog.tsx`, `scheduled-command-form-dialog.tsx`, `client-insurances-view.tsx`, `form-builder-view.tsx`, `ib-admin-analytics-view.tsx`, `bonus-assignment-logs-view.tsx`, `PositionsReportView`, `client-ib-progression-panel.tsx`, `forms-list-view.tsx`, `form-document.ts`, `ib-reward/index.ts`, `contest-workspace-panels.tsx`, `ib-plan-programs-sync-view.tsx`, `trading-account-access-dialog.tsx`, `client-analytics-behavior-panel.tsx`, `button.tsx`, `SiteHeader`, `reward-lines-dialog.tsx`, `client-analytics-profitability-panel.tsx`, `IbProgramSymbolsView`, `ib-reward-logs/index.ts`, `client-risk-metrics-view.tsx`, `site-header.tsx`, `trading-migrations-view.tsx`, `ib-program-payment-rules-view.tsx`, `ib-earnings-content.tsx`, `configuration-view.tsx`, `client-analytics-dashboard-panel.tsx`, `TradingAccountsView`, `ib-program/api.ts`, `dialog.tsx`, `forms-view.tsx`, `client-analytics-symbol-panel.tsx`, `ib-admin-analytics/api.ts`, `input.tsx`, `ib-plan-subscriptions-view.tsx`, `BonusExcludedInstrumentsView`, `contest-workspace-view.tsx`, `positions-report-view.tsx`, `api-error-alert.tsx`, `client-analytics-risk-drawdown-panel.tsx`, `ib-volume-reward-trades-report-view.tsx`, `table.tsx`, `app-area-bar.tsx`, `IbProgramsView`, `contests-view.tsx`, `skeleton.tsx`, `IbVolumeRewardTradesReportView`, `DialogTitle`, `insurance-plan-form-dialog.tsx`, `client-trading-account-create-dialog.tsx`, `ib-referrals-content.tsx`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `browserBrokerRequest()` connect `browserBrokerRequest` to `contest/api.ts`, `ib-program-payment-rule-form-dialog.tsx`, `initial-amount-delete-dialog.tsx`, `insurance/index.ts`, `client-risk-metrics/api.ts`, `updateSymbolsMarkup`, `scheduled-command-form-dialog.tsx`, `ib-plan-subscription/index.ts`, `client-trading-account/api.ts`, `client-insurances-view.tsx`, `trading-server/api.ts`, `bonus-assignment-logs-view.tsx`, `client-contest-detail-view.tsx`, `PositionsReportView`, `client-ib-progression-panel.tsx`, `forms-list-view.tsx`, `public-risk-metrics-view.tsx`, `ib-reward/index.ts`, `contest-workspace-panels.tsx`, `bonus-offer/api.ts`, `server-group-edit-sheet.tsx`, `risk-control-view.tsx`, `client-bonuses-view.tsx`, `trading-account-access-dialog.tsx`, `trading-account/api.ts`, `trading-account-positions-dialog.tsx`, `reward-lines-dialog.tsx`, `IbProgramSymbolsView`, `ib-reward-logs/index.ts`, `ib-volume-reward-trades/types.ts`, `ib-plan/api.ts`, `platform/api.ts`, `bonus-offer-template-form-dialog.tsx`, `trading-migrations-view.tsx`, `ib-program-payment-rules-view.tsx`, `initial-amount/api.ts`, `configuration-view.tsx`, `use-account-positions-channel.ts`, `ib-program/api.ts`, `ib-payment-template/api.ts`, `position-report-detail-dialog.tsx`, `symbol-category/api.ts`, `ib-admin-analytics/api.ts`, `client-positions/api.ts`, `position-history-view.tsx`, `client-bonus/api.ts`, `contest-general-form.tsx`, `BonusExcludedInstrumentsView`, `ContestSubscriptionsView`, `contest-workspace-view.tsx`, `client-trading-account/format.ts`, `ib-subscription-form-dialog.tsx`, `errors.ts`, `leverage/api.ts`, `ib-progression-templates-view.tsx`, `listIbPaymentTemplates`, `ib-partner-tier-panel.tsx`, `bonus-offer-admin-assign-dialog.tsx`, `RiskMetricsShareDialog`, `config-form.ts`, `browser-client.ts`, `getBonusOffer`, `bonus-offer-form-dialog.tsx`, `ServerGroupLeveragesSyncDialog`, `ib-referrals-content.tsx`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **What connects `AdminLoginPageProps`, `ClientLoginPageProps`, `AccountMetricsPageProps` to the rest of the system?**
  _580 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `contest/api.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08246753246753247 - nodes in this community are weakly interconnected._
- **Should `broker-response.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14444444444444443 - nodes in this community are weakly interconnected._
- **Should `insurance/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05228105228105228 - nodes in this community are weakly interconnected._