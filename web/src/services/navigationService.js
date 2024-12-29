let navigate;

export const setNavigate = (navFunction) => {
  navigate = navFunction;
};

export const navigateToLogin = () => {
  if (navigate) {
    navigate("/login"); // Redirect to login screen
  } else {
    console.error("Navigation function is not set.");
  }
};
