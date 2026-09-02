package main

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"net"
	"time"

	"report-service/pb" // Проверь правильность пути к твоим pb файлам

	"github.com/jung-kurt/gofpdf"
	"github.com/wcharczuk/go-chart/v2"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

type server struct {
	pb.UnimplementedReportGeneratorServer
}

func (s *server) GeneratePdfReport(ctx context.Context, req *pb.ReportRequest) (*pb.ReportResponse, error) {
	log.Printf("Generating report: %s", req.Title)

	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	pdf.SetFont("Arial", "B", 16)
	pdf.CellFormat(190, 10, req.Title, "0", 1, "C", false, 0, "")

	pdf.SetFont("Arial", "I", 12)
	pdf.CellFormat(190, 10, req.DateRangeLabel, "0", 1, "C", false, 0, "")
	pdf.Ln(10)

	currentY := pdf.GetY()

	for i, metric := range req.Metrics {
		var xValues []time.Time
		var yValues []float64

		for _, pt := range metric.Points {
			xValues = append(xValues, time.UnixMilli(pt.Timestamp))
			yValues = append(yValues, float64(pt.Value))
		}

		graph := chart.Chart{
			Title: metric.MetricName,
			XAxis: chart.XAxis{
				Name: "Time",
			},
			YAxis: chart.YAxis{
				Name: "Quantity",
			},
			Series: []chart.Series{
				chart.TimeSeries{
					Name:    metric.MetricName,
					XValues: xValues,
					YValues: yValues,
				},
			},
		}

		var imgBuf bytes.Buffer
		err := graph.Render(chart.PNG, &imgBuf)
		if err != nil {
			log.Printf("Error rendering chart: %v", err)
			continue
		}

		imgName := fmt.Sprintf("chart_%d", i)
		opt := gofpdf.ImageOptions{ImageType: "PNG"}
		pdf.RegisterImageOptionsReader(imgName, opt, &imgBuf)

		if currentY+100 > 280 {
			pdf.AddPage()
			currentY = pdf.GetY()
		}
		pdf.ImageOptions(imgName, 10, currentY, 190, 100, false, opt, 0, "")

		currentY += 110
		pdf.SetY(currentY)
	}

	var buf bytes.Buffer
	if err := pdf.Output(&buf); err != nil {
		log.Printf("Error saving PDF: %v", err)
		return &pb.ReportResponse{ErrorMessage: err.Error()}, nil
	}

	return &pb.ReportResponse{PdfContent: buf.Bytes()}, nil
}

func main() {
	listener, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("Network error: %v", err)
	}

	grpcServer := grpc.NewServer()
	pb.RegisterReportGeneratorServer(grpcServer, &server{})
	reflection.Register(grpcServer)

	fmt.Println("Go gRPC server started on port 50051...")
	if err := grpcServer.Serve(listener); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
