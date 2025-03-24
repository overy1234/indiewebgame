document.addEventListener('DOMContentLoaded', async () => {
  // URL에서 게시물 ID 가져오기
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  
  if (!postId) {
    showError('게시물 ID가 없습니다.');
    window.location.href = 'index.html';
    return;
  }
  
  try {
    // Supabase에서 게시물 데이터 가져오기
    const { data: post, error } = await supabaseClient
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single();
    
    if (error) throw error;
    
    if (!post) {
      showError('게시물을 찾을 수 없습니다.');
      window.location.href = 'index.html';
      return;
    }
    
    // 게시물 렌더링
    renderPost(post);
    
    // 문서 제목 업데이트
    document.title = `${post.title} - 인디코드 블로그`;
    
  } catch (error) {
    showError(error.message);
  }
});

// 게시물 렌더링 함수
function renderPost(post) {
  // 마크드 설정
  marked.setOptions({
    highlight: function(code, lang) {
      if (window.hljs && lang) {
        try {
          return window.hljs.highlight(code, { language: lang }).value;
        } catch (e) {
          return window.hljs.highlightAuto(code).value;
        }
      }
      return code;
    },
    breaks: true
  });
  
  // 제목과 날짜 표시
  document.getElementById('post-title').textContent = post.title;
  document.getElementById('post-date').innerHTML = `<i class="ri-calendar-line"></i> ${formatDate(post.created_at)}`;
  
  // 커버 이미지 표시 (있는 경우)
  const coverContainer = document.getElementById('post-cover');
  if (post.cover_image) {
    coverContainer.innerHTML = `<img src="${post.cover_image}" alt="${post.title}">`;
  } else {
    coverContainer.style.display = 'none';
  }
  
  // 내용 렌더링 (마크다운 -> HTML)
  const contentElement = document.getElementById('post-content');
  contentElement.innerHTML = marked.parse(post.content);
  
  // 코드 블록에 하이라이트 적용
  if (window.hljs) {
    document.querySelectorAll('pre code').forEach((block) => {
      window.hljs.highlightElement(block);
    });
  }
} 