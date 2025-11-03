import { useState, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, FileText, Download, Loader2 } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        toast.success("PDF berhasil dipilih!");
      } else {
        toast.error("Hanya file PDF yang diperbolehkan!");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
        toast.success("PDF berhasil dipilih!");
      } else {
        toast.error("Hanya file PDF yang diperbolehkan!");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Pilih file PDF terlebih dahulu!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API}/upload-pdf`, formData, {
        responseType: "blob",
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `BCA_Statement_${new Date().getTime()}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      toast.success("Excel berhasil didownload!");
      setFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(
        error.response?.data?.detail ||
          "Gagal memproses PDF. Pastikan format file benar."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4" data-testid="header-section">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1E3A8A] tracking-tight">
            Mutasi2XLS
          </h1>
          <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto">
            Konversi mutasi rekening BCA dari PDF ke Excel dengan kategori
            otomatis dan tampilan yang rapih
          </p>
        </div>

        {/* Upload Card */}
        <Card
          className="shadow-xl border-2 border-[#60A5FA] bg-white/90 backdrop-blur-sm"
          data-testid="upload-card"
        >
          <CardContent className="p-8 sm:p-12">
            <div
              className={`border-3 border-dashed rounded-2xl p-8 sm:p-16 text-center transition-all ${
                dragActive
                  ? "border-[#1E3A8A] bg-[#DBEAFE]"
                  : "border-[#93C5FD] bg-[#F0F9FF]"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              data-testid="drop-zone"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                data-testid="file-input"
              />

              <div className="space-y-6">
                {!file ? (
                  <>
                    <div className="flex justify-center">
                      <div className="p-6 bg-[#DBEAFE] rounded-full">
                        <Upload className="w-12 h-12 text-[#1E3A8A]" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-800">
                        Drag & drop PDF BCA di sini
                      </p>
                      <p className="text-sm text-gray-600">atau</p>
                    </div>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-semibold px-8 py-6 text-lg rounded-xl transition-all shadow-lg hover:shadow-xl"
                      data-testid="browse-button"
                    >
                      Pilih File PDF
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex justify-center">
                      <div className="p-6 bg-green-100 rounded-full">
                        <FileText className="w-12 h-12 text-green-600" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-gray-800">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <div className="flex gap-4 justify-center flex-wrap">
                      <Button
                        onClick={() => {
                          setFile(null);
                          toast.info("File dihapus");
                        }}
                        variant="outline"
                        className="border-2 border-gray-300 hover:border-gray-400 px-6 py-3 rounded-xl font-medium"
                        data-testid="remove-file-button"
                      >
                        Hapus File
                      </Button>
                      <Button
                        onClick={handleUpload}
                        disabled={loading}
                        className="bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                        data-testid="convert-button"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Memproses...
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5 mr-2" />
                            Konversi ke Excel
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="features-section">
          <Card className="bg-white/80 backdrop-blur-sm border border-[#93C5FD] shadow-lg">
            <CardContent className="p-6 text-center space-y-2">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold text-lg text-[#1E3A8A]">
                Privasi Terjaga
              </h3>
              <p className="text-sm text-gray-600">
                Tidak ada satupun data yang dikirim ke server
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-[#93C5FD] shadow-lg">
            <CardContent className="p-6 text-center space-y-2">
              <div className="text-3xl mb-2">🎨</div>
              <h3 className="font-semibold text-lg text-[#1E3A8A]">
                Cepat & Mudah
              </h3>
              <p className="text-sm text-gray-600">
                Download file Excel tanpa perlu registrasi
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-[#93C5FD] shadow-lg">
            <CardContent className="p-6 text-center space-y-2">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold text-lg text-[#1E3A8A]">
                Gunakan Kapanpun
              </h3>
              <p className="text-sm text-gray-600">
                Tidak ada batasan waktu ataupun limit penggunaan
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          {/* <p>Powered by Emergent AI</p> */}
        </div>
      </div>
    </div>
  );
};

export default HomePage;