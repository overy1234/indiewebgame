// Supabase 설정
const SUPABASE_URL = 'https://amejjiiaihsaqcivtnaa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtZWpqaWlhaWhzYXFjaXZ0bmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1NTg2OTUsImV4cCI6MjA1NjEzNDY5NX0.GluCTZYpEhp99tuF7yuhmQv_-XVZ8C5X21DcWH0K0SU';

// Supabase 클라이언트 초기화
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 유틸리티 함수
function formatDate(dateString) {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('ko-KR', options);
}

// 에러 핸들링
function showError(message) {
  console.error(message);
  alert(`오류가 발생했습니다: ${message}`);
}

// 이미지 업로드 함수
async function uploadImage(file) {
  try {
    // 파일 이름에서 공백 제거 및 안전한 파일명 생성
    const originalName = file.name.replace(/\s+/g, '_');
    const filename = `${Date.now()}_${originalName}`;
    const filePath = `images/${filename}`;
    
    // 스토리지에 파일 업로드
    const { data, error } = await supabaseClient.storage
      .from('blog-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    
    // 공개 URL 가져오기
    const { data: publicUrlData } = supabaseClient.storage
      .from('blog-images')
      .getPublicUrl(filePath);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    showError(`이미지 업로드에 실패했습니다: ${error.message}`);
    return null;
  }
} 