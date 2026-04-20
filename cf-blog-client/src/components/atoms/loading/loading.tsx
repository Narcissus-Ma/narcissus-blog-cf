import { useEffect, useRef, useState } from 'react';

import styles from './loading.module.css';

export function Loading() {
  const loadingRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      if (progressRef.current) {
        progressRef.current.style.width = `${progress}%`;
      }
    }, 100);

    const endLoading = () => {
      setIsLoading(false);
      if (loadingRef.current) {
        loadingRef.current.classList.add('loaded');
      }
    };

    // 页面加载完成后结束加载
    window.addEventListener('load', endLoading);
    
    // 3秒后强制结束加载，防止加载时间过长
    const timeoutId = setTimeout(endLoading, 3000);

    return () => {
      window.removeEventListener('load', endLoading);
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <>
      {/* 进度条 */}
      <div className={styles.progressParent}>
        <div ref={progressRef} className={styles.progress}></div>
      </div>
      {/* 加载动画 */}
      <div ref={loadingRef} id="loading-box" className={styles.loadingBox} onClick={() => {
        setIsLoading(false);
        if (loadingRef.current) {
          loadingRef.current.classList.add('loaded');
        }
      }}>
        <div className={styles.loadingBg}>
          <img 
            src="https://npm.elemecdn.com/anzhiyu-blog-static@1.0.4/img/avatar.jpg" 
            alt="加载头像" 
            className={styles.loadingImg}
          />
          <div className={styles.loadingImageDot}></div>
        </div>
      </div>
    </>
  );
}
