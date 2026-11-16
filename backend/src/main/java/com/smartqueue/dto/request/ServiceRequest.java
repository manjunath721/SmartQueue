package com.smartqueue.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ServiceRequest {

    @NotBlank(message = "Service name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @NotBlank(message = "Service code is required")
    @Size(max = 15, message = "Code must not exceed 15 characters")
    private String code;

    @NotBlank(message = "Token prefix is required")
    @Size(max = 5, message = "Prefix must not exceed 5 characters")
    private String prefix;

    private String description;

    @NotNull(message = "Average duration is required")
    @Min(value = 1, message = "Average duration must be at least 1 minute")
    private Integer avgDurationMinutes;

    private Boolean active = true;

    public ServiceRequest() {}

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getPrefix() {
        return prefix;
    }

    public void setPrefix(String prefix) {
        this.prefix = prefix;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getAvgDurationMinutes() {
        return avgDurationMinutes;
    }

    public void setAvgDurationMinutes(Integer avgDurationMinutes) {
        this.avgDurationMinutes = avgDurationMinutes;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
