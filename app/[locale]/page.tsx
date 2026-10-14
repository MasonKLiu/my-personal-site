'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

// 必須使用 dynamic 關閉 SSR，因為 Markdown 編輯器依賴瀏覽器的 navigator 與 window 物件
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function Home() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('**在這裡開始撰寫 Markdown...**');
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 切換開關：決定要打 Supabase 還是你自己的 Go/C# 微服務 API
  const USE_LOCAL_API = false;

  const handleSave = async () => {
    if (!title.trim()) {
      setStatus('請輸入標題');
      return;
    }

    setIsSaving(true);
    setStatus('儲存中...');

    try {
      if (USE_LOCAL_API) {
        // 串接自定義的 REST / GraphQL API
        const res = await fetch(`${process.env.NEXT_PUBLIC_LOCAL_API_URL}/notes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content })
        });
        
        if (!res.ok) throw new Error('API 發生錯誤');
        setStatus('已成功儲存至本地 API！');
      } else {
        // 串接 Supabase
        const { error } = await supabase
          .from('notes')
          .insert([{ title, content }]);
          
        if (error) throw error;
        setStatus('已成功同步至 Supabase！');
      }
    } catch (error: any) {
      console.error(error);
      setStatus(`儲存失敗: ${error.message || '未知錯誤'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex flex-col sm:flex-row items-center justify-between border-b pb-4 mt-8">
        <h1 className="text-3xl font-bold text-gray-800">工程師技術筆記</h1>
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <span className="text-sm text-gray-500 font-medium">{status}</span>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-slate-800 text-white font-medium rounded hover:bg-slate-700 transition disabled:opacity-50"
          >
            {isSaving ? '處理中...' : '發布文章'}
          </button>
        </div>
      </header>

      <section className="space-y-4">
        <input 
          type="text" 
          placeholder="請輸入文章標題..." 
          className="w-full text-2xl p-2 border-b-2 border-transparent focus:border-slate-800 outline-none bg-transparent transition"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        <div data-color-mode="light" className="shadow-sm border rounded overflow-hidden">
          <MDEditor
            value={content}
            onChange={(val) => setContent(val || '')}
            height={600}
            preview="live"
          />
        </div>
      </section>
    </main>
  );
}