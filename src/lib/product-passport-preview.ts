export interface ProductPassportPreviewField {
  label: string;
  value: string;
}

export interface ProductPassportPreviewGroup {
  title: string;
  fields: ProductPassportPreviewField[];
}

const pending = "待补充";

export const productPassportPreviewGroups: ProductPassportPreviewGroup[] = [
  {
    title: "基础资料",
    fields: [
      { label: "产品名称", value: "评估后展示" },
      { label: "品牌", value: "评估后展示" },
      { label: "规格", value: pending },
      { label: "原产地", value: pending },
      { label: "发货地", value: pending },
      { label: "SKU / 批次号", value: pending },
    ],
  },
  {
    title: "成分资料",
    fields: [
      { label: "主要成分", value: pending },
      { label: "成分含量", value: pending },
      { label: "适用场景", value: "按健康分层结果展示" },
      { label: "适用人群", value: pending },
      { label: "不适用人群", value: pending },
      { label: "过敏原提示", value: pending },
      { label: "孕期 / 哺乳期提示", value: pending },
      { label: "用药 / 慢病提示", value: pending },
    ],
  },
  {
    title: "证据资料",
    fields: [
      { label: "检测 / 追溯资料", value: pending },
      { label: "标签照片", value: pending },
      { label: "生产日期 / 有效期", value: pending },
      { label: "第三方认证，如适用", value: pending },
      { label: "供应商资料，如适用", value: pending },
    ],
  },
  {
    title: "跨境履约",
    fields: [
      { label: "发货地", value: pending },
      { label: "预计配送时效", value: pending },
      { label: "物流追踪方式", value: pending },
      { label: "跨境申报说明", value: pending },
      { label: "清关提示", value: pending },
      { label: "售后政策", value: pending },
      { label: "退货条件", value: pending },
      { label: "破损 / 错发处理", value: pending },
    ],
  },
];

export const productPassportPreviewRequiredFields = productPassportPreviewGroups.flatMap(
  (group) => group.fields.map((field) => field.label),
);
