import { Eye, EyeSlash, Key, Sms } from "iconsax-reactjs";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginForm } from "../../schemas/auth.schema";

// LoginPage
export default function LoginPage() {
  const navigate = useNavigate();
  const { login: loginApi } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    try {
      await loginApi(data.email, data.password);
      navigate("/");
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? "Login gagal";
      if (typeof detail === "string") {
        const lower = detail.toLowerCase();
        if (lower.includes("email")) {
          setError("email", { type: "server", message: detail });
          return;
        }
        if (lower.includes("password") || lower.includes("sandi")) {
          setError("password", { type: "server", message: detail });
          return;
        }
      }
      setServerError(detail);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-6 rounded-lg space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Siap konsultasi?</h2>
          <p className="text-grey-600">
            Kami udah nungguin kamu, Yuk! buat harimu menenangkan.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block mb-1 text-md font-medium text-grey-900">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Sms size="24" />
              </span>
              <input
                type="email"
                {...register("email")}
                className="w-full pl-12 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500"
                placeholder="masukkan email"
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-md font-medium text-grey-900">
              Kata Sandi
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Key size="24" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="w-full pl-12 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500"
                placeholder="••••••••"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeSlash size="24" /> : <Eye size="24" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>
          {serverError && <p style={{ color: "red" }}>{serverError}</p>}
          <button
            type="submit"
            className="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Memuat..." : "Masuk"}
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          Belum punya akun?{" "}
          <Link to="/register" className="text-primary-500 hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
