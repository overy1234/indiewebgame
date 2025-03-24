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
    // 파일 확장자 추출
    const fileExt = file.name.split('.').pop();
    // 안전한 파일명 생성 (타임스탬프 + 랜덤 문자열 + 확장자)
    const randomString = Math.random().toString(36).substring(2, 10);
    const safeFileName = `${Date.now()}_${randomString}.${fileExt}`;
    const filePath = `images/${safeFileName}`;
    
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
    alert(`이미지 업로드에 실패했습니다: ${error.message}`);
    return null;
  }
}

// 인증 관련 함수
async function checkAdminPassword(password) {
  try {
    // 비밀번호 확인을 위한 Supabase 쿼리
    const { data, error } = await supabaseClient
      .from('admin_settings')
      .select('password')
      .single();
    
    if (error) throw error;
    
    // 저장된 비밀번호가 없는 경우 초기 설정
    if (!data) {
      // 기본 비밀번호 설정 (최초 실행 시)
      await supabaseClient
        .from('admin_settings')
        .insert([{ password: '인디코드', id: 1 }]);
      
      return password === '인디코드';
    }
    
    // 저장된 비밀번호와 비교
    return data.password === password;
  } catch (error) {
    console.error('비밀번호 확인 오류:', error);
    // 에러 발생 시 기본 비밀번호로 폴백
    return password === '인디코드';
  }
} 