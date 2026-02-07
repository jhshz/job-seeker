import { Flex, Input } from "@chakra-ui/react";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  location: string;
  onLocationChange: (v: string) => void;
  type: string;
  onTypeChange: (v: string) => void;
  tags: string;
  onTagsChange: (v: string) => void;
};

const JOB_TYPES = [
  { value: "", label: "همه نوع‌ها" },
  { value: "full-time", label: "تمام وقت" },
  { value: "part-time", label: "پاره وقت" },
  { value: "remote", label: "دورکاری" },
  { value: "hybrid", label: "ترکیبی" },
  { value: "contract", label: "قراردادی" },
  { value: "internship", label: "کارآموزی" },
  { value: "freelance", label: "دورکاری" },
];

export function JobFilters({
  search,
  onSearchChange,
  location,
  onLocationChange,
  type,
  onTypeChange,
  tags,
  onTagsChange,
}: Props) {
  return (
    <Flex gap="4" wrap="wrap" mb="6">
      <Input
        placeholder="جستجو"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        maxW="200px"
      />
      <Input
        placeholder="شهر"
        value={location}
        onChange={(e) => onLocationChange(e.target.value)}
        maxW="150px"
      />
      <select
        value={type}
        onChange={(e) => onTypeChange(e.target.value)}
        style={{
          maxWidth: "150px",
          padding: "8px 12px",
          borderRadius: "6px",
          border: "1px solid var(--chakra-colors-border)",
          background: "var(--chakra-colors-bg)",
        }}
      >
        {JOB_TYPES.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <Input
        placeholder="تگ‌ها (کاما جدا)"
        value={tags}
        onChange={(e) => onTagsChange(e.target.value)}
        maxW="200px"
      />
    </Flex>
  );
}
