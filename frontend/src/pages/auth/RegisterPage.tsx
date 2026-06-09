import { Eye, EyeSlash, Key, Sms, User } from "iconsax-reactjs";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterForm } from "../../schemas/auth.schema";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerApi } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  });

  const onSubmit = async (data: RegisterForm) => {
    setServerError(null);
    try {
      await registerApi(data.email, data.username, data.password);
      navigate("/login");
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? "Register gagal";
      if (
        typeof detail === "string" &&
        detail.toLowerCase().includes("email")
      ) {
        setError("email", { type: "server", message: detail });
        return;
      }
      setServerError(detail);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-6 rounded-lg space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Hai, Selamat Datang!</h2>
          <p className="text-grey-600">
            Buat akun dulu, supaya bisa konsultasi dengan nyaman.
          </p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block mb-1 text-md font-medium text-grey-900">
              Nama
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <User size="24" />
              </span>
              <input
                type="text"
                {...register("username")}
                className="w-full pl-12 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500"
                placeholder="masukkan nama"
                disabled={isSubmitting}
              />
            </div>
            {errors.username && (
              <p className="text-xs text-red-500 mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

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
          <div>
            <label className="block mb-1 text-md font-medium text-grey-900">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Key size="24" />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className="w-full pl-12 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500"
                placeholder="••••••••"
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlash size="24" />
                ) : (
                  <Eye size="24" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          {serverError && <p className="text-sm text-red-500">{serverError}</p>}
          <button
            type="submit"
            className="w-full bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Memuat..." : "Daftar"}
          </button>
        </form>

        <p className="text-sm mt-4 text-center">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-primary-500 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
