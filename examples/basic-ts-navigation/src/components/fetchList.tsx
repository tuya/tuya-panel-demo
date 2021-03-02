import React, { useState, useEffect } from 'react';
import { TYFlatList } from 'tuya-panel-kit';

export function FetchList({ pageId = 'main' }: { pageId: string }) {
  const [dataSource, setDataSource] = useState<{ title: string; key: string }[]>([]);
  let timerId: number;

  useEffect(() => {
    if (!timerId) {
      timerId = setInterval(() => {
        const idx = dataSource.length;
        const value = `${pageId}_title_${idx}`;
        const item = { title: value, key: value };
        dataSource.push(item);
        setDataSource([...dataSource]);
      }, 1000);
    }
    return () => {
      clearInterval(timerId);
    };
  });

  return <TYFlatList data={dataSource} />;
}
