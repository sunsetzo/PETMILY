import {
  GoogleLoginPage as LoginGoogle,
  KakaoLogin as LoginKaKao,
  LoginNaver,
  PasswordResetModal,
  PortalPopup,
} from 'components';
import { useCallback, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import authAtom from 'states/auth';
import userAtom from 'states/users';
import logo from 'static/images/logo.svg';
import CONSTANTS from 'utils/constants';
import useFetch from 'utils/fetch';
import { validateEmail } from 'utils/utils';

function Login() {
  const navigate = useNavigate();
  const [isPasswordResetModalOpen, setPasswordResetModalOpen] = useState(false);
  const loginEmail = useRef(null);
  const loginPassword = useRef(null);
  const [validationError, setValidationError] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const setUsers = useSetRecoilState(userAtom);
  const setAuth = useSetRecoilState(authAtom);

  const openPasswordResetModal = useCallback(() => {
    setPasswordResetModalOpen(true);
  }, []);

  const closePasswordResetModal = useCallback(() => {
    setPasswordResetModalOpen(false);
  }, []);
  const fetchUser = useFetch();
  const handleLogin = async () => {
    if (!email.trim() || !password.trim() || validateEmail(email)) {
      setValidationError(true);
      return;
    }
    // 로그인 데이터 백엔드에 전달
    try {
      const response = await fetchUser.post('login', {
        userEmail: email,
        userPw: password,
      });

      console.log(response);
      localStorage.setItem('user', JSON.stringify(response));
      if (response.message === '이메일이 존재하지 않거나 비밀번호가 틀림') {
        setValidationError(true);
        setPassword('');
      } else {
        const { accessToken, refreshToken } = response.data;
        const { userEamil, userNickname } = response.data;
        setAuth({ accessToken, refreshToken });
        setUsers({ userEamil, userNickname });
      }
      if (response.data.nickName !== '') {
        navigate('/');
      } else {
        navigate('/userinfo');
      }
    } catch (error) {
      console.log(error);
      setValidationError(true);
      setPassword('');
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-start pt-10 bg-whitesmoke-100 w-full overflow-hidden text-left text-5xl text-dodgerblue font-pretendard">
        <div className="min-h-screen w-[450px] flex flex-col items-center justify-center gap-[43px]">
          <div className="relative w-[197px] text-[50px] font-one-mobile-pop-otf">
            <img className="w-[200px] h-auto" src={logo} alt="" />
          </div>
          <div className="self-stretch flex flex-col items-center justify-start text-xl text-darkgray">
            <div className="rounded-8xs bg-white box-border w-full flex flex-row  items-center justify-start ">
              <input
                className={`focus:outline-none self-stretch rounded-tl-3xs rounded-tr-3xs bg-white w-full flex flex-row py-5 px-4
            items-center justify-start text-black border-[1.5px] border-solid border-darkgray 
            ${
              validationError ? ' border-red' : 'focus:border-dodgerblue'
            }  focus:border-1.5 font-pretendard text-base 
            hover:brightness-95 focus:brightness-100`}
                ref={loginEmail}
                placeholder="이메일"
                onChange={e => {
                  setValidationError(false);
                  setEmail(e.target.value);
                }}
                value={email}
              />
            </div>
            <div className="rounded-8xs bg-white box-border w-full flex flex-row  items-center justify-start">
              <input
                type="password"
                className={`focus:outline-none self-stretch rounded-bl-3xs rounded-br-3xs bg-white w-full flex flex-row py-5 px-4
            items-center justify-start text-black border-[1.5px] border-solid border-darkgray 
            ${
              validationError ? 'border-red' : 'focus:border-dodgerblue'
            } focus:border-1.5 font-pretendard text-base 
            hover:brightness-95 focus:brightness-100 mt-[-1px]`}
                ref={loginPassword}
                placeholder={CONSTANTS.STRINGS.PASSWORD}
                value={password}
                onChange={e => {
                  setValidationError(false);
                  setPassword(e.target.value);
                }}
              />
            </div>
          </div>
          <div
            role="presentation"
            className="self-stretch rounded-31xl bg-dodgerblue h-[72.02px] flex flex-row items-center justify-center text-white hover:brightness-110 cursor-pointer"
            onClick={handleLogin}
          >
            <b className="relative tracking-[0.01em] leading-[125%]">로그인</b>
          </div>
          <div className="flex flex-row items-start justify-start gap-[50px] text-slategray">
            <span
              role="presentation"
              className="relative tracking-[0.01em] leading-[50%] flex items-center w-fit text-xl shrink-0 cursor-pointer  hover:brightness-125"
              onClick={openPasswordResetModal}
            >
              {CONSTANTS.STRINGS.RESET_PASSWORD}
            </span>
            <Link
              className="relative no-underline text-slategray tracking-[0.01em] leading-[50%] flex items-center w-[84px] text-xl shrink-0 cursor-pointer hover:brightness-125"
              role="presentation"
              to="/join"
            >
              {CONSTANTS.HEADER.JOIN}
            </Link>
          </div>
          <div className="w-full flex flex-row items-center justify-start gap-[49px] text-center text-[16px] text-lightslategray">
            <hr className="border-solid w-full h-0.5 bg-darkgray brightness-125" />
            <div className="relative inline-block w-[22px] shrink-0">OR</div>
            <hr className="border-solid w-full h-0.5 bg-darkgray brightness-125" />
          </div>
          <div className="flex flex-row items-center justify-center gap-[48px] pb-10">
            <LoginGoogle />
            <LoginKaKao />
            <LoginNaver />
          </div>
        </div>
      </div>
      {isPasswordResetModalOpen && (
        <PortalPopup
          overlayColor="rgba(113, 113, 113, 0.4)"
          placement="Centered"
          onOutsideClick={closePasswordResetModal}
        >
          <PasswordResetModal onClose={closePasswordResetModal} />
        </PortalPopup>
      )}
    </>
  );
}

export default Login;
