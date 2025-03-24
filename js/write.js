document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('post-form');
  const submitBtn = document.getElementById('submit-btn');
  const titleInput = document.getElementById('title');
  const contentArea = document.getElementById('content');
  const descriptionArea = document.getElementById('description');
  
  // 마크다운 에디터 초기화
  const easyMDE = new EasyMDE({
    element: contentArea,
    spellChecker: false,
    autosave: {
      enabled: true,
      uniqueId: 'blogPostContent',
      delay: 1000,
    },
    placeholder: '마크다운을 사용하여 글을 작성하세요...',
    toolbar: [
      'bold', 'italic', 'heading', '|',
      'quote', 'code', 'unordered-list', 'ordered-list', '|',
      'link', 'image', '|',
      'preview', 'side-by-side', 'fullscreen', '|',
      'guide'
    ]
  });

  // 폼 제출 처리
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 입력값 가져오기
    const title = titleInput.value.trim();
    const content = easyMDE.value().trim();
    const description = descriptionArea.value.trim() || content.substring(0, 200);
    const coverImage = document.getElementById('cover-image').value.trim();
    
    // 유효성 검사
    if (!title) {
      alert('제목을 입력해주세요.');
      titleInput.focus();
      return;
    }
    
    if (!content) {
      alert('내용을 입력해주세요.');
      easyMDE.codemirror.focus();
      return;
    }
    
    // 제출 버튼 비활성화 및 텍스트 변경
    submitBtn.disabled = true;
    submitBtn.textContent = '저장 중...';
    
    try {
      // Supabase에 데이터 저장
      const { data, error } = await supabaseClient
        .from('posts')
        .insert([
          {
            title,
            content,
            description,
            cover_image: coverImage || null,
            created_at: new Date().toISOString(),
            published: true
          }
        ]);
      
      if (error) throw error;
      
      // 저장 성공 시 홈페이지로 이동
      alert('글이 성공적으로 저장되었습니다!');
      window.location.href = 'index.html';
      
    } catch (error) {
      // 에러 처리
      showError(error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = '게시하기';
    }
  });
}); 