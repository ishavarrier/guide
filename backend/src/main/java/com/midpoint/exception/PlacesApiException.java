package com.midpoint.exception;

/**
 * Exception thrown when the Google Places API returns an error status
 */
public class PlacesApiException extends RuntimeException {
    
    private final String apiStatus;
    
    public PlacesApiException(String apiStatus) {
        super("Places API error: " + apiStatus);
        this.apiStatus = apiStatus;
    }
    
    public PlacesApiException(String apiStatus, Throwable cause) {
        super("Places API error: " + apiStatus, cause);
        this.apiStatus = apiStatus;
    }
    
    public String getApiStatus() {
        return apiStatus;
    }
}

