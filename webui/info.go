package webui

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"time"
)

type ControllerInfo struct {
	IP        string `json:"ip"`
	Time      string `json:"time"`
	StartTime string `json:"start_time"`
}

func (h *APIHandler) Info(w http.ResponseWriter, r *http.Request) {
	ip, err := getIP(h.Interface)
	if err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to detect ip for interface '"+h.Interface+"'. Error: "+err.Error(), w)
	}
	info := ControllerInfo{
		Time:      time.Now().Format("Mon Jan 2 15:04:05"),
		IP:        ip,
		StartTime: h.controller.StartTime(),
	}
	w.Header().Set("Content-Type", "application/json")
	encoder := json.NewEncoder(w)
	if err := encoder.Encode(&info); err != nil {
		errorResponse(http.StatusInternalServerError, "Failed to encode json. Error: "+err.Error(), w)
	}
}

func getIP(i string) (string, error) {
	iface, err := net.InterfaceByName(i)
	if err != nil {
		return "", err
	}
	addrs, err := iface.Addrs()
	if err != nil {
		return "", err
	}
	for _, v := range addrs {
		switch s := v.(type) {
		case *net.IPNet:
			if s.IP.To4() != nil {
				return s.IP.To4().String(), nil
			}
		}
	}
	return "", fmt.Errorf("Cant detect IP of interface:%s", i)
}