import { Pagination } from 'antd';

interface PaginationBarProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
}

export function PaginationBar({ page, pageSize, total, onChange }: PaginationBarProps) {
  return (
    <Pagination
      current={page}
      pageSize={pageSize}
      total={total}
      showSizeChanger
      onChange={onChange}
      showTotal={(count) => `共 ${count} 条`}
    />
  );
}
