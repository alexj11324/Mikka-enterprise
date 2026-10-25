# #230/#231 公共安全核心与企业扩展：暂停点

本地候选：a3ed50866bd8b9c76223192f1f9a1220ead0b0bc（未 push）。公开分支仍为 721bbf3615f7b9a3672c149112382dac75c72cb8，draft PR #264。当前仓库 LICENSE 为 AGPL-3.0；本文只整理技术和发布边界，不变更 license、仓库、可见性或既有公开历史。

建议：暂停新增企业控制面和正向预算适配的实现/公开发布；继续现有公开入口必要的安全修复与隔离回归。不要通过暂停工作留下已知旁路，也不要把已公开代码称为已私有化。待父线程边界审阅后，才能决定哪些变更可以发布。

| 范围 | 技术边界建议 | 本 lane 实际状态 |
|---|---|---|
| OAuth/worker MCP 当前身份、owner、成员身份、run/token/session 重新验证 | 公共安全底座；任何发行方式都需要 | 已公开 OAuth 修复；本地补 worker credential body 后复查 |
| 受保护副作用前的通用准入 hook、失败拒绝、版本签名验证、取消/deadline、重试/不确定结果禁止重放 | 公共执行核心；企业适配不得绕过核心限制 | SDK hidden retry 已禁；本地 credential executor/claim hook 正补最终 gate |
| 组织/团队/项目/用户层的集中策略管理、发布/回滚/撤销/分发、管理员 API | 企业控制面候选；与已有公共 workspace 权限边界分开审阅 | 早期版本已在 #264 公开。冻结扩展，不删历史；a3ed508 没有新增管理 API |
| provider/model/endpoint 的最终精确匹配、防止绕路 | 通用执行安全，留在公共发送边界 | 现有拒绝式 guard 保留 |
| 企业统一模型目录、地区/地域治理规则、组织范围配置/运营管理 | 企业控制面候选 | 已公开基础实现待边界审阅，暂停新增 |
| reservation 归属/租期、body cancellation、uncertain outcome、不能双扣 | 通用执行安全接口；不是商业计费 SKU | #265 提供生命周期；本 lane 正向适配尚未开始，现暂停 |
| 组织 allocation 管理、operator cap、企业范围限流/预算配置 | 企业管理能力候选，与实际账单/订阅区分 | 由 #265 owner 负责，本 lane 不复制；不改真实 allocation |
| 审计追加写、原始 owner/scope 证据、同库事务 | 公共安全基础依赖；原始 scope 不能直接当权限 | 复用 #210 writer，无新审计底层。历史 personal/missing 父链拒绝 |
| 企业审计运营/合规导出/保留管理 | 需由审计 owner 与父线程独立划边界 | 本 lane 未新增该类管理功能 |

当前代码存在交叉耦合：`lib/policy/runtime.ts` 与 `store.ts` 同时承担公共执行入口和组织策略读取；`/api/policy` 是管理入口。后续需要可审阅的 authority/lifecycle 接口分开“执行必须遵守约束”与“谁配置企业约束”。未安装企业扩展时，核心不能把已受管 workspace 默认为 unrestricted。不能仅去掉 `policyBudgetUnavailable` 来启用正向请求。

跨 lane 依赖：

- #210/#259：使用 `appendAudit(tx,tenant,AuditEvent)`、事务 helper 和 scope 证据；没有复制底层。新父链修复 `1b39b709` 只覆盖合法新 INSERT 的继承，不回填旧 personal/缺失历史。本地 SQL overlay 只用于合成隔离库测试，不是最终组合源验收。
- #265 `50598846`：生命周期必须复用既有 Agent/Coordinator reservation，在实际 policy-locked send 前最终重验 owner/workspace/resource/route；revalidate 不续租，deadline 覆盖 response body，uncertain 禁重放。quota app DB 与 policy workspace DB 无分布式原子性。正向适配暂停，未去掉现有拒绝。
- 父线程负责 #268/#265 的统一 release 组合、最终 exact SHA/Preview、生产迁移/部署。该 lane 不自行合并 main、公开新企业实现、改 IAM/凭证或消费真实 provider。

本地 a3ed508 的必要安全修复（准备但未公开）：

1. worker credential MCP callback 在 body 解析后复查 run token/live owner/issue/policy；共享 credential executor 对 owner、原始 run/workspace 和副作用准入作最终检查。
2. retry scope 失败延迟到已持有 app 事务的最终 claim hook，让现有 Factory/Skill 的 409 拒绝及锁等待测试继续覆盖原路径，同时合法抵达 claim 的不可信 retry 在 assignment/token 前拒绝并回滚 queued。
3. 合成 OAuth/worker token 共享同一次“认证后首次发布策略”的竞态回归；未配置 provider/vault/真实 OAuth。

公开 721bbf3 的实际 CI：policy workflow 通过（21 policy 测试零跳过、224 protocol、247 daemon/9显式跳过、build、67 compiled Next HTTP）。主 CI 84 browser 通过、1跳过、2后端失败（Factory/Skill retry 409→403）；安全修复正在本地复验，不能发布为可用 release。另 `test:agent` 在 9532817 base 和 721bbf3 都是 51通过/3相同静态断言失败，未改前端/削弱断言。

本地测试/证据只保留文件系统，不向公共 evidence 分支发布本批内容。已有公开提交保留。

## 最终本地安全检查

源码 a3ed508，未 push：typecheck/lint 通过；21 policy/PG 检查零跳过；74 次真实 HTTP 请求通过（包含新增 worker credential 的认证后发布策略负例及 generic retry 最终 claim hook 拒绝）；独立 Node24/Next webpack production build 通过；原 Factory/Skill/worker 三个 production HTTP 回归全部通过（18.2s，未修改断言）。

前两次本地尝试分别保留了 cold-route 15s 超时、以及 127.0.0.1 请求与 localhost middleware rewrite 不一致导致的 signup 重定向循环。旧超时请求未重放；原测试夹具 finally 清理后 readback 行已不在，结果不冒充通过。改用现有 CI 的 localhost 测试 origin 后三例全通过，没有改产品认证逻辑/真实配置。

证据位于 [proof-a3ed508](proof/environment-results.json)，完整重现命令保留于本目录的 local-build/local-serve-localhost 和 a3-production-localhost-e2e 配置。没有向公共 evidence 分支发布本批内容。公开 721bbf3 主 CI 仍是 2 个后端失败；a3ed508 只有本地 build/隔离回归，没有 exact-SHA 远程 CI，因发布正待公共/企业边界审阅。不能把它称为已发布/生产验收完成。

本文件保留本地暂停时的判断与历史状态；父线程随后仅授权向同 owner 的 private 证据分支上传本批材料，未授权公开 #264 push、main/overlay 代码变更或部署。复现摘要见 REPRODUCTION.md。
