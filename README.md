# LightEarth Web Pro - Giám Sát Năng Lượng Mặt Trời

<div align="center">

![Version](https://img.shields.io/badge/version-08052-blue.svg)
![.NET](https://img.shields.io/badge/.NET-8.0-purple.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Railway](https://img.shields.io/badge/deploy-Railway-black.svg)

**Hệ thống giám sát năng lượng mặt trời thời gian thực cho biến tần Lumentree**

[Demo trực tiếp](https://solar-monitor-dashboard-production.up.railway.app/?deviceId=P250812032) | [Báo cáo lỗi](https://github.com/zixfel/lumentree-dashboard-main/issues) | [Yêu cầu tính năng](https://github.com/zixfel/lumentree-dashboard-main/issues)

</div>

---

## Giới thiệu

**LightEarth Web Pro** là ứng dụng web toàn diện để giám sát và trực quan hóa dữ liệu năng lượng từ hệ thống điện mặt trời Lumentree. Ứng dụng cung cấp giao diện trực quan để theo dõi sản lượng điện mặt trời, tình trạng pin, tiêu thụ điện và tương tác lưới điện theo thời gian thực.

### Tính năng nổi bật

- **Giám sát thời gian thực** qua giao thức MQTT
- **Luồng năng lượng trực quan** - Hiển thị dòng chảy năng lượng giữa PV, Pin, Lưới điện và Tải
- **Biểu đồ tương tác** cho dữ liệu lịch sử
- **Điện áp cell pin** - Theo dõi từng cell pin với độ lệch và cảnh báo
- **Giao diện responsive** - Tối ưu cho desktop và mobile
- **Dark/Light mode** - Chế độ sáng/tối tự động
- **Cập nhật SignalR** - Dữ liệu cập nhật không cần tải lại trang

---

## Ảnh chụp màn hình

### Giao diện chính - Luồng năng lượng thời gian thực

```
┌─────────────────────────────────────────────────────────────┐
│  ⚡ Giám Sát Năng Lượng Mặt Trời - LightEarth Web Pro       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    ☀️ PV1        ☀️ PV2           🔋 Pin         🏠 Tải    │
│    1200W         800W             67%            450W       │
│       ↓            ↓               ↕              ↑        │
│    ┌────────────────────────────────────────────────┐      │
│    │              BIẾN TẦN LUMENTREE                │      │
│    │              SUNT-6.0kW-T                      │      │
│    │              Nhiệt độ: 42°C                    │      │
│    └────────────────────────────────────────────────┘      │
│                          ↕                                  │
│                    ⚡ Lưới EVN                              │
│                       224V                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Biểu đồ sản lượng điện trong ngày

```
Công suất (W)
    │
3000│        ████████
    │      ██        ██
2000│    ██            ██
    │  ██                ██
1000│██                    ██
    │                        ██
   0├──────────────────────────────
    6h   9h   12h   15h   18h   21h
```

### Điện áp Cell Pin

```
┌──────────────────────────────────────────────────────┐
│  Điện Áp Pin │ Trung Bình │ Cao Nhất │ Thấp Nhất │ Độ Lệch │
│    52.3V     │   3.28V    │  3.31V   │   3.25V   │  0.06V  │
├──────────────────────────────────────────────────────┤
│ Cell 1: 3.28V │ Cell 2: 3.29V │ Cell 3: 3.27V │ ...    │
│ Cell 4: 3.31V │ Cell 5: 3.28V │ Cell 6: 3.25V │ ...    │
└──────────────────────────────────────────────────────┘
```

---

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|------------|-----------|
| **Backend** | ASP.NET Core 8.0 |
| **Frontend** | HTML, JavaScript, Tailwind CSS |
| **Biểu đồ** | Chart.js |
| **Real-time** | SignalR WebSocket |
| **MQTT** | MQTTnet |
| **API** | RestSharp |
| **Logging** | Serilog |
| **Deploy** | Railway |

---

## Dữ liệu thu thập qua MQTT

### Thông tin thiết bị
- ID thiết bị và loại
- Phiên bản firmware
- Nhiệt độ biến tần
- Chế độ hoạt động (Hòa lưới/Độc lập/UPS)
- Trạng thái online

### Sản lượng PV (Quang điện)
- Điện áp PV1 và PV2 (V)
- Công suất PV1 và PV2 (W)
- Tổng công suất PV

### Thông số Pin
- Điện áp pin tổng (V)
- Phần trăm sạc (%)
- Công suất sạc/xả (W)
- Dòng điện pin (A)
- Điện áp từng cell (V)
- Trạng thái: Đang sạc / Đang xả / Chờ

### AC Output/Input
- Điện áp AC đầu ra (V)
- Tần số AC (Hz)
- Công suất AC (W)
- Điện áp lưới điện (V)
- Công suất lưới (W) - Nhập/Xuất

### Dữ liệu tiêu thụ
- Tải cổng load (W) - Essential Load
- Tải hòa lưới (W) - Home Load

---

## Cài đặt

### Yêu cầu

- **.NET 8.0 SDK** trở lên
- **Git**

### Hướng dẫn cài đặt

1. **Clone repository**
   ```bash
   git clone https://github.com/zixfel/lumentree-dashboard-main.git
   cd lumentree-dashboard-main
   ```

2. **Restore dependencies**
   ```bash
   dotnet restore
   ```

3. **Build project**
   ```bash
   dotnet build
   ```

4. **Chạy ứng dụng**
   ```bash
   dotnet run --project LumenTreeInfo.API
   ```

5. **Truy cập**
   - HTTP: http://localhost:5165
   - HTTPS: https://localhost:7077

---

## Cấu trúc dự án

```
lumentree-dashboard-main/
├── LumenTreeInfo.API/          # Web Application
│   ├── Controllers/            # API Controllers
│   ├── Views/                  # Razor Views
│   ├── wwwroot/               # Static files (CSS, JS, Icons)
│   │   ├── css/
│   │   ├── js/
│   │   └── icons/             # Icon biến tần, pin, lưới...
│   └── DeviceHub.cs           # SignalR Hub
├── LumenTreeInfo.Lib/          # Core Library
│   ├── SolarInverterMonitor.cs # MQTT Client
│   ├── LumentreeClient.cs      # API Client
│   └── Models/                 # Data Models
├── LumenTreeInfo.Cmd/          # Command Line Tool
└── README.md
```

---

## Triển khai Production

### Railway (Khuyến nghị)

1. Fork repository về tài khoản GitHub của bạn
2. Đăng nhập [Railway](https://railway.app)
3. Tạo project mới từ GitHub repo
4. Railway sẽ tự động detect .NET và deploy

### Docker

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY ./publish .
EXPOSE 5165
ENTRYPOINT ["dotnet", "LumenTreeInfo.API.dll"]
```

### Build Production

```bash
dotnet publish LumenTreeInfo.API -c Release -o ./publish
```

---

## Cấu hình

### appsettings.json

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "SolarMonitor": {
    "UserId": "YOUR_USER_ID",
    "MqttBroker": "lesvr.suntcn.com",
    "MqttPort": 1886
  },
  "AllowedHosts": "*"
}
```

---

## Khắc phục sự cố

### Không kết nối được MQTT
- Kiểm tra kết nối internet
- Xác minh Device ID hợp lệ
- Kiểm tra MQTT broker: `lesvr.suntcn.com:1886`

### Không có dữ liệu biểu đồ
- Kiểm tra ngày đã chọn có dữ liệu
- Xác minh thiết bị online trong ngày đó
- Kiểm tra Console browser để xem lỗi

### SignalR không kết nối
- Kiểm tra WebSocket không bị chặn
- Xem Console browser để debug

---

## Đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/tinh-nang-moi`)
3. Commit thay đổi (`git commit -m 'Thêm tính năng mới'`)
4. Push lên branch (`git push origin feature/tinh-nang-moi`)
5. Tạo Pull Request

---

## Giấy phép

Dự án này được cấp phép theo [MIT License](LICENSE).

---

## Tác giả

**LightEarth Team**

- Website: [lightearth.vn](https://lightearth.vn)
- GitHub: [@zixfel](https://github.com/zixfel)

---

## Lời cảm ơn

- [MQTTnet](https://github.com/dotnet/MQTTnet) - Thư viện MQTT
- [Chart.js](https://www.chartjs.org/) - Biểu đồ
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [SignalR](https://dotnet.microsoft.com/apps/aspnet/signalr) - Real-time communication
- [Lumentree](http://www.lumentree.co/) - API và thiết bị

---

<div align="center">

**Được phát triển với ❤️ bởi LightEarth Team**

⭐ Nếu bạn thấy dự án hữu ích, hãy cho chúng tôi một star!

</div>
