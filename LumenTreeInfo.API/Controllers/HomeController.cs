using System.Diagnostics;
using LumenTreeInfo.API.Models;
using LumenTreeInfo.Lib;
using Microsoft.AspNetCore.Mvc;
using Serilog;

namespace LumenTreeInfo.API.Controllers;

/// <summary>
/// Controller for handling home page and device data requests
/// </summary>
public class HomeController : Controller
{
    private readonly LumentreeClient _client;

    /// <summary>
    /// Initializes a new instance of the HomeController
    /// </summary>
    /// <param name="client">Lumentree API client</param>
    public HomeController(LumentreeClient client)
    {
        _client = client;
    }

    /// <summary>
    /// Returns the home page view
    /// </summary>
    [Route("/")]
    public IActionResult Index()
    {
        Log.Information("Rendering home page");
        return View();
    }

    /// <summary>
    /// Returns the calculator page
    /// </summary>
    [Route("/calculator")]
    public IActionResult Calculator()
    {
        Log.Information("Rendering calculator page");
        return PhysicalFile(
            Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "calculator.html"),
            "text/html"
        );
    }

    /// <summary>
    /// Gets and returns device information and energy data
    /// </summary>
    /// <param name="deviceId">The device ID to get information for</param>
    /// <param name="date">Optional date parameter (defaults to current date)</param>
    [Route("/device/{deviceId}")]
    public async Task<IActionResult> GetDeviceInfo(string deviceId, string? date)
    {
        if (string.IsNullOrEmpty(deviceId))
        {
            Log.Warning("Device ID is null or empty");
            return BadRequest(new { error = "Device ID is required", code = "MISSING_DEVICE_ID" });
        }

        Log.Information("Getting device info for device {DeviceId} with date {Date}", deviceId, date);

        try
        {
            // Parse the date or use current date if not provided
            var queryDate = DateTime.Now;
            if (!string.IsNullOrEmpty(date))
            {
                if (DateTime.TryParse(date, out var parsedDate))
                {
                    queryDate = parsedDate;
                    Log.Debug("Using parsed date: {QueryDate:yyyy-MM-dd}", queryDate);
                }
                else
                {
                    Log.Warning("Failed to parse date: {Date}, using current date instead", date);
                }
            }

            // Get all device data using the enhanced client method
            var (deviceInfo, pvData, batData, essentialLoad, grid, load) =
                await _client.GetAllDeviceDataAsync(deviceId, queryDate);

            if (deviceInfo == null)
            {
                Log.Warning("No device info found for device {DeviceId}. This could be due to: invalid device ID, API connection issues, or expired token.", deviceId);
                return NotFound(new { 
                    error = $"Không tìm thấy thiết bị \"{deviceId}\".",
                    code = "DEVICE_NOT_FOUND",
                    deviceId = deviceId,
                    message = "Hệ thống không thể kết nối đến server Lumentree hoặc Device ID không hợp lệ.",
                    suggestions = new[] {
                        "Kiểm tra lại Device ID (ví dụ: P250812032)",
                        "Thử tải lại trang sau vài giây",
                        "Server Lumentree có thể đang bảo trì"
                    },
                    canRetry = true
                });
            }

            // Handle null data gracefully - create default empty objects if needed
            var result = new
            {
                DeviceInfo = deviceInfo,
                Pv = pvData ?? CreateDefaultPvInfo(),
                Bat = batData ?? CreateDefaultBatData(),
                EssentialLoad = essentialLoad ?? CreateDefaultLoadInfo("EssentialLoad"),
                Grid = grid ?? CreateDefaultLoadInfo("Grid"),
                Load = load ?? CreateDefaultLoadInfo("HomeLoad")
            };

            Log.Information("Successfully retrieved and returning data for device {DeviceId}", deviceId);
            return Json(result);
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error occurred while getting device data for {DeviceId}", deviceId);
            return StatusCode(500, new { 
                error = "Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.",
                code = "INTERNAL_ERROR",
                details = ex.Message
            });
        }
    }

    /// <summary>
    /// Creates a default PV info object for cases when data is not available
    /// </summary>
    private static LumenTreeInfo.Lib.Models.LumentreeApiModels.PVInfo CreateDefaultPvInfo()
    {
        return new LumenTreeInfo.Lib.Models.LumentreeApiModels.PVInfo
        {
            TableKey = "pv",
            TableName = "PV",
            TableValue = 0,
            TableValueInfo = new List<int>()
        };
    }

    /// <summary>
    /// Creates a default battery data object for cases when data is not available
    /// </summary>
    private static LumenTreeInfo.Lib.Models.LumentreeApiModels.BatData CreateDefaultBatData()
    {
        return new LumenTreeInfo.Lib.Models.LumentreeApiModels.BatData
        {
            Bats = new List<LumenTreeInfo.Lib.Models.LumentreeApiModels.BatInfo>
            {
                new LumenTreeInfo.Lib.Models.LumentreeApiModels.BatInfo { TableName = "Charge", TableKey = "charge", TableValue = 0 },
                new LumenTreeInfo.Lib.Models.LumentreeApiModels.BatInfo { TableName = "Discharge", TableKey = "discharge", TableValue = 0 }
            },
            TableValueInfo = new List<int>()
        };
    }

    /// <summary>
    /// Creates a default load info object for cases when data is not available
    /// </summary>
    private static LumenTreeInfo.Lib.Models.LumentreeApiModels.LoadInfo CreateDefaultLoadInfo(string name)
    {
        return new LumenTreeInfo.Lib.Models.LumentreeApiModels.LoadInfo
        {
            TableKey = name.ToLower(),
            TableName = name,
            TableValue = 0,
            TableValueInfo = new List<int>()
        };
    }

    /// <summary>
    /// Gets today's energy summary for a device
    /// </summary>
    /// <param name="deviceId">The device ID</param>
    [Route("/device/{deviceId}/today")]
    public async Task<IActionResult> GetTodayData(string deviceId)
    {
        if (string.IsNullOrEmpty(deviceId))
        {
            return BadRequest("Device ID is required");
        }

        try
        {
            var (deviceInfo, pvData, batData, essentialLoad, grid, load) =
                await _client.GetAllDeviceDataAsync(deviceId, DateTime.Now);

            if (pvData == null)
            {
                return NotFound($"No data found for device {deviceId}");
            }

            var result = new
            {
                DeviceId = deviceId,
                Date = DateTime.Now.ToString("yyyy-MM-dd"),
                SolarKwh = (pvData.TableValue) / 10.0,
                LoadKwh = (load?.TableValue ?? 0) / 10.0,
                GridKwh = (grid?.TableValue ?? 0) / 10.0,
                BatChargeKwh = batData?.Bats != null && batData.Bats.Count > 0 
                    ? (batData.Bats[0].TableValue) / 10.0 : 0,
                BatDischargeKwh = batData?.Bats != null && batData.Bats.Count > 1 
                    ? (batData.Bats[1].TableValue) / 10.0 : 0,
                EssentialLoadKwh = (essentialLoad?.TableValue ?? 0) / 10.0
            };

            return Json(result);
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error getting today data for {DeviceId}", deviceId);
            return StatusCode(500, "An error occurred");
        }
    }

    /// <summary>
    /// Gets summary data for a device within a date range
    /// </summary>
    /// <param name="deviceId">The device ID</param>
    /// <param name="from">Start date (yyyy-MM-dd)</param>
    /// <param name="to">End date (yyyy-MM-dd)</param>
    [Route("/device/{deviceId}/summary")]
    public async Task<IActionResult> GetSummaryData(string deviceId, string? from, string? to)
    {
        if (string.IsNullOrEmpty(deviceId))
        {
            return BadRequest("Device ID is required");
        }

        try
        {
            var fromDate = string.IsNullOrEmpty(from) 
                ? DateTime.Now.AddMonths(-1) 
                : DateTime.Parse(from);
            var toDate = string.IsNullOrEmpty(to) 
                ? DateTime.Now 
                : DateTime.Parse(to);

            var dailyData = new List<object>();
            var monthlyTotals = new Dictionary<string, (double load, double grid, double pv, int days)>();

            for (var date = fromDate; date <= toDate; date = date.AddDays(1))
            {
                try
                {
                    var (deviceInfo, pvData, batData, essentialLoad, grid, load) =
                        await _client.GetAllDeviceDataAsync(deviceId, date);

                    if (pvData != null)
                    {
                        var monthKey = date.ToString("yyyy-MM");
                        var loadKwh = (load?.TableValue ?? 0) / 10.0;
                        var gridKwh = (grid?.TableValue ?? 0) / 10.0;
                        var pvKwh = (pvData.TableValue) / 10.0;

                        if (!monthlyTotals.ContainsKey(monthKey))
                        {
                            monthlyTotals[monthKey] = (0, 0, 0, 0);
                        }

                        var current = monthlyTotals[monthKey];
                        monthlyTotals[monthKey] = (
                            current.load + loadKwh,
                            current.grid + gridKwh,
                            current.pv + pvKwh,
                            current.days + 1
                        );

                        dailyData.Add(new
                        {
                            Date = date.ToString("yyyy-MM-dd"),
                            LoadKwh = loadKwh,
                            GridKwh = gridKwh,
                            PvKwh = pvKwh
                        });
                    }
                }
                catch
                {
                    // Skip days with no data
                }
            }

            var monthlyData = monthlyTotals.Select(m => new
            {
                Month = m.Key,
                Load = Math.Round(m.Value.load, 1),
                Grid = Math.Round(m.Value.grid, 1),
                Pv = Math.Round(m.Value.pv, 1),
                Days = m.Value.days
            }).OrderBy(m => m.Month).ToList();

            return Json(new
            {
                DeviceId = deviceId,
                FromDate = fromDate.ToString("yyyy-MM-dd"),
                ToDate = toDate.ToString("yyyy-MM-dd"),
                TotalDays = dailyData.Count,
                MonthlyData = monthlyData,
                DailyData = dailyData
            });
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error getting summary data for {DeviceId}", deviceId);
            return StatusCode(500, "An error occurred");
        }
    }

    /// <summary>
    /// Gets monthly data for calculator (proxy to lumentree.net API)
    /// Returns data in the same format as lumentree.net/api/monthly/{deviceId}
    /// </summary>
    /// <param name="deviceId">The device ID</param>
    [Route("/device/{deviceId}/monthly")]
    public async Task<IActionResult> GetMonthlyData(string deviceId)
    {
        if (string.IsNullOrEmpty(deviceId))
        {
            return BadRequest("Device ID is required");
        }

        try
        {
            Log.Information("Fetching monthly data from lumentree.net for device {DeviceId}", deviceId);
            
            using var httpClient = new HttpClient();
            httpClient.Timeout = TimeSpan.FromSeconds(30);
            
            // Fetch directly from lumentree.net API
            var apiUrl = $"https://lumentree.net/api/monthly/{deviceId}";
            
            var response = await httpClient.GetAsync(apiUrl);
            
            if (!response.IsSuccessStatusCode)
            {
                Log.Warning("Lumentree API returned {StatusCode} for device {DeviceId}", 
                    response.StatusCode, deviceId);
                return StatusCode((int)response.StatusCode, "Failed to fetch data from Lumentree");
            }
            
            var content = await response.Content.ReadAsStringAsync();
            
            // Parse and return the JSON directly
            var data = System.Text.Json.JsonSerializer.Deserialize<object>(content);
            
            Log.Information("Successfully fetched monthly data for device {DeviceId}", deviceId);
            return Json(data);
        }
        catch (HttpRequestException ex)
        {
            Log.Error(ex, "HTTP error fetching monthly data for {DeviceId}", deviceId);
            return StatusCode(502, $"Failed to connect to Lumentree API: {ex.Message}");
        }
        catch (TaskCanceledException ex)
        {
            Log.Error(ex, "Timeout fetching monthly data for {DeviceId}", deviceId);
            return StatusCode(504, "Request to Lumentree API timed out");
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error getting monthly data for {DeviceId}", deviceId);
            return StatusCode(500, "An error occurred while fetching monthly data");
        }
    }

    /// <summary>
    /// Gets SOC timeline data from lumentree.net API for SOC chart
    /// Proxy to https://lumentree.net/api/soc/{deviceId}/{date}
    /// Returns timeline array with {soc, t} for each 5-minute interval
    /// </summary>
    /// <param name="deviceId">The device ID</param>
    /// <param name="date">Date in format yyyy-MM-dd</param>
    [Route("/device/{deviceId}/soc")]
    public async Task<IActionResult> GetSOCData(string deviceId, string? date)
    {
        if (string.IsNullOrEmpty(deviceId))
        {
            return BadRequest("Device ID is required");
        }

        try
        {
            // Use provided date or current date
            var queryDate = string.IsNullOrEmpty(date) 
                ? DateTime.Now.ToString("yyyy-MM-dd") 
                : date;
            
            Log.Information("Fetching SOC data from lumentree.net for device {DeviceId} on {Date}", deviceId, queryDate);
            
            using var httpClient = new HttpClient();
            httpClient.Timeout = TimeSpan.FromSeconds(15);
            
            // Fetch from lumentree.net SOC API
            var apiUrl = $"https://lumentree.net/api/soc/{deviceId}/{queryDate}";
            
            var response = await httpClient.GetAsync(apiUrl);
            
            if (!response.IsSuccessStatusCode)
            {
                Log.Warning("Lumentree SOC API returned {StatusCode} for device {DeviceId}", 
                    response.StatusCode, deviceId);
                return StatusCode((int)response.StatusCode, "Failed to fetch SOC data from Lumentree");
            }
            
            var content = await response.Content.ReadAsStringAsync();
            
            // Parse and return the JSON directly
            var data = System.Text.Json.JsonSerializer.Deserialize<object>(content);
            
            Log.Information("Successfully fetched SOC data for device {DeviceId} on {Date}", deviceId, queryDate);
            return Json(data);
        }
        catch (HttpRequestException ex)
        {
            Log.Error(ex, "HTTP error fetching SOC data for {DeviceId}", deviceId);
            return StatusCode(502, $"Failed to connect to Lumentree API: {ex.Message}");
        }
        catch (TaskCanceledException ex)
        {
            Log.Error(ex, "Timeout fetching SOC data for {DeviceId}", deviceId);
            return StatusCode(504, "Request to Lumentree API timed out");
        }
        catch (Exception ex)
        {
            Log.Error(ex, "Error getting SOC data for {DeviceId}", deviceId);
            return StatusCode(500, "An error occurred while fetching SOC data");
        }
    }

    /// <summary>
    /// Debug endpoint to test connectivity to Lumentree API
    /// </summary>
    [Route("/debug/connectivity")]
    public async Task<IActionResult> TestConnectivity()
    {
        var results = new Dictionary<string, object>();
        
        // Test 1: DNS Resolution
        try
        {
            var addresses = await System.Net.Dns.GetHostAddressesAsync("lesvr.suntcn.com");
            results["dns_resolution"] = new { 
                success = true, 
                addresses = addresses.Select(a => a.ToString()).ToArray() 
            };
        }
        catch (Exception ex)
        {
            results["dns_resolution"] = new { success = false, error = ex.Message };
        }
        
        // Test 2: HTTP Connection to Lumentree API
        try
        {
            using var httpClient = new HttpClient();
            httpClient.Timeout = TimeSpan.FromSeconds(10);
            var response = await httpClient.GetAsync("http://lesvr.suntcn.com/lesvr/getServerTime");
            var content = await response.Content.ReadAsStringAsync();
            results["lumentree_api"] = new { 
                success = response.IsSuccessStatusCode, 
                status_code = (int)response.StatusCode,
                response = content.Length > 500 ? content.Substring(0, 500) : content
            };
        }
        catch (Exception ex)
        {
            results["lumentree_api"] = new { success = false, error = ex.Message };
        }
        
        // Test 3: Token Generation
        try
        {
            var token = await _client.GenerateToken("P250801055");
            results["token_generation"] = new { 
                success = !string.IsNullOrEmpty(token), 
                token_preview = token?.Substring(0, Math.Min(8, token?.Length ?? 0)) + "..." 
            };
        }
        catch (Exception ex)
        {
            results["token_generation"] = new { success = false, error = ex.Message };
        }
        
        return Json(results);
    }

    /// <summary>
    /// Returns an error view
    /// </summary>
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        Log.Warning("Error page requested. RequestId: {RequestId}",
            Activity.Current?.Id ?? HttpContext.TraceIdentifier);

        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
