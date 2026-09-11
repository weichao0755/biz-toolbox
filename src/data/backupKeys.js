/* 平台全部用户数据 key（唯一来源）
 * 各工具的表单状态 + 生成记录 + 旧版兼容 key + 各工具独立 AI 配置
 * ⚠️ 新增工具或新的 localStorage key 必须同步登记到这里，
 *    否则不会进入「数据备份与恢复」和「本地文件夹同步」
 */
export const BACKUP_KEYS = [
  'hightech_ai_config',
  'sales_cases_ai_config',
  'contract_tool_data_v2',
  'contract_records_v1',
  'contract_ai_cfg',
  'qual_app_v1',
  'qual_records_v1',
  'qual_ai_config',
  'dd_report_data_v1',
  'dd_records_v1',
  'qref_records_v1',
  'qual_search_config',
  'qref_local_data',
  'quote_tool_data_v2',
  'quote_records_v1',
  'quote_price_lib_v1',
  'installment_tool_data_v1',
  'installment_records_v1',
  'sales_cases_v1',
  'sales_cases_draft_v1',
  'sales_cases_biztypes_v1',
  'sales_cases_entitytypes_v1',
  'todo_v1',
  'todo_lists_v1',
  'huashu_v1',
  'huashu_cats_v1',
  'huashu_vars_v1',
  'huashu_favs_v1',
  'huashu_stats_v1'
]
export default BACKUP_KEYS
